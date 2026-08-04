import { type ReflectedProperty, type ReflectedClass } from "types/Globals";

const ReflectionService = game.GetService("ReflectionService");
const allCapabilities = new SecurityCapabilities(...Enum.SecurityCapability.GetEnumItems());

export namespace InstanceAST {
	export interface IInstanceNode {
		Instance: Instance;
		ClassName: string;
		IsCreatable: boolean;
		Properties: Map<string, IPropertyData>;
		DifferentProperties: Array<string>;
		Id: number;
		ChildrenIds: number[];
		ParentId: number;
	}

	export interface IPropertyData {
		Name: string;
		Value: unknown;
		Readonly: boolean;
	}

	export interface IInstanceAST {
		Registry: Map<number, IInstanceNode>;
		Roots: number[];
	}

	export const EMPTY_NODE_ID = -1;

	interface IInstanceHierarchy {
		Registry: Map<number, IInstanceHierarchyNode>;
		Roots: number[];
	}

	interface IInstanceHierarchyNode {
		Instance: Instance;
		Id: number;
		ChildrenIds: number[];
		ParentId: number;
	}

	function BuildHierarchy(instances: Instance[]): IInstanceHierarchy {
		let id = 0;
		const reverse_id_map = new Map<Instance, number>();
		const instance_hierarchy: IInstanceHierarchy = {
			Registry: new Map<number, IInstanceHierarchyNode>(),
			Roots: [],
		};

		for (const instance of instances) {
			const node: IInstanceHierarchyNode = {
				Instance: instance,
				Id: id,
				ChildrenIds: [],
				ParentId: EMPTY_NODE_ID,
			};

			reverse_id_map.set(instance, id);
			instance_hierarchy.Registry.set(id, node);
			id += 1;
		}

		for (const instance of instances) {
			const node = instance_hierarchy.Registry.get(reverse_id_map.get(instance)!)!;
			const parent = instance.Parent;
			if (parent === undefined) {
				instance_hierarchy.Roots.push(node.Id);
				continue;
			}

			const parent_id = reverse_id_map.get(parent);
			if (parent_id === undefined) {
				instance_hierarchy.Roots.push(node.Id);
				continue;
			}
			node.ParentId = parent_id;
			instance_hierarchy.Registry.get(parent_id)!.ChildrenIds.push(node.Id);
		}

		return instance_hierarchy;
	}

	/**key - name, value - is_readonly */
	type PropertyNamesMap = Map<string, boolean>;

	const cached_full_instance_property_names_map = new Map<string, PropertyNamesMap>();
	function GetFullInstancePropertyNamesMap(class_name: string): PropertyNamesMap {
		if (cached_full_instance_property_names_map.has(class_name)) {
			return cached_full_instance_property_names_map.get(class_name)!;
		}
		const property_names_map = new Map<string, boolean>();

		const properties = ReflectionService.GetPropertiesOfClass(class_name, {
			Security: allCapabilities,
		}) as Array<ReflectedProperty>;
		for (const prop of properties) {
			if (prop.Display?.DeprecationMessage !== undefined) continue;
			const is_readonly = prop.Permits.Write === undefined;
			property_names_map.set(prop.Name, is_readonly);
		}

		cached_full_instance_property_names_map.set(class_name, property_names_map);
		return property_names_map;
	}

	let cached_default_instance_properties: Map<string, Map<string, IPropertyData>> | undefined =
		undefined;
	function GetDefaultInstanceProperties() {
		if (cached_default_instance_properties !== undefined) {
			return cached_default_instance_properties;
		}

		cached_default_instance_properties = new Map<string, Map<string, IPropertyData>>();

		const classes = ReflectionService.GetClasses({
			Security: allCapabilities,
		}) as Array<ReflectedClass>;
		for (const reflectedClass of classes) {
			const class_name = reflectedClass.Name;
			const [success, instance] = pcall(() => new Instance(class_name as never) as Instance);
			if (!success) continue;
			const property_names_map = GetFullInstancePropertyNamesMap(class_name);
			const properties = new Map<string, IPropertyData>();
			for (const [name, is_readonly] of property_names_map) {
				const [success, v] = pcall(() => instance[name as never] as unknown);
				if (!success) continue;
				properties.set(name, {
					Name: name,
					Value: v,
					Readonly: is_readonly,
				});
			}
			cached_default_instance_properties!.set(class_name, properties);
		}

		return cached_default_instance_properties;
	}

	export function BuildAst(instances: Instance[]) {
		const instance_hierarchy = BuildHierarchy(instances);
		const default_instance_properties = GetDefaultInstanceProperties();

		const instance_ast: IInstanceAST = {
			Registry: new Map<number, IInstanceNode>(),
			Roots: instance_hierarchy.Roots,
		};

		for (const [id, node] of instance_hierarchy.Registry) {
			const instance = node.Instance;
			const class_name = instance.ClassName;
			const reflectedClass = ReflectionService.GetClass(class_name, {
				Security: allCapabilities,
			}) as ReflectedClass | undefined;
			const is_creatable = reflectedClass?.Permits.New !== undefined;
			const default_properties = default_instance_properties.get(class_name);
			const property_names_map = GetFullInstancePropertyNamesMap(class_name);

			const properties = new Map<string, IPropertyData>();
			const different_properties = new Array<string>();

			for (const [name, is_readonly] of property_names_map) {
				const [success, v] = pcall(() => instance[name as never] as unknown);
				if (!success) continue;
				properties.set(name, {
					Name: name,
					Value: v,
					Readonly: is_readonly,
				});
			}

			if (class_name === "UICorner") {
				const corner_radius = properties.get("CornerRadius")?.Value as UDim | undefined;
				const top_left = properties.get("TopLeftRadius")?.Value as UDim | undefined;
				const top_right = properties.get("TopRightRadius")?.Value as UDim | undefined;
				const bottom_left = properties.get("BottomLeftRadius")?.Value as UDim | undefined;
				const bottom_right = properties.get("BottomRightRadius")?.Value as UDim | undefined;

				if (corner_radius && top_left && top_right && bottom_left && bottom_right) {
					const all_same =
						top_left === corner_radius &&
						top_right === corner_radius &&
						bottom_left === corner_radius &&
						bottom_right === corner_radius;

					if (all_same) {
						properties.delete("TopLeftRadius");
						properties.delete("TopRightRadius");
						properties.delete("BottomLeftRadius");
						properties.delete("BottomRightRadius");
					} else {
						properties.delete("CornerRadius");
					}
				}
			}

			if (default_properties !== undefined) {
				for (const [name, default_property] of default_properties) {
					const property_data = properties.get(name)!;
					if (property_data.Value === default_property.Value) continue;
					different_properties.push(name);
				}
			}

			const instance_node: IInstanceNode = {
				Instance: instance,
				ClassName: class_name,
				IsCreatable: is_creatable,
				Properties: properties,
				DifferentProperties: different_properties,
				Id: id,
				ChildrenIds: node.ChildrenIds,
				ParentId: node.ParentId,
			};
			instance_ast.Registry.set(id, instance_node);
		}

		return instance_ast;
	}
}
