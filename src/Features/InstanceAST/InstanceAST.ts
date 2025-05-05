import { ApiDumpConstants, GetApiDump } from "@rbxts/api-dump-fetcher";

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
		const api_dump = GetApiDump().expect();
		const property_names_map = new Map<string, boolean>();

		while (class_name !== ApiDumpConstants.ROOT_SUPER_CLASS) {
			const instance_data = api_dump.Classes.find((class_data) => {
				return class_data.Name === class_name;
			});
			assert(instance_data, `Instance ${class_name} not found in API dump`);

			for (const member of instance_data.Members) {
				if (member.MemberType !== ApiDumpConstants.EMemberMemberType.Property) continue;
				if (member.Tags !== undefined) {
					if (member.Tags.includes(ApiDumpConstants.EMemberTag.NotScriptable)) continue;
					if (member.Tags.includes(ApiDumpConstants.EMemberTag.Deprecated)) continue;
					if (member.Tags.includes(ApiDumpConstants.EMemberTag.Hidden)) continue;
					if (member.Tags.includes(ApiDumpConstants.EMemberTag.NotBrowsable)) continue;
				}
				const is_readonly = member.Tags?.includes(ApiDumpConstants.EMemberTag.ReadOnly) ?? false;
				property_names_map.set(member.Name, is_readonly);
			}
			class_name = instance_data.Superclass;
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

		const api_dump = GetApiDump().expect();
		cached_default_instance_properties = new Map<string, Map<string, IPropertyData>>();

		const class_names = api_dump.Classes.map((c) => c.Name);
		for (const class_name of class_names) {
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
			const is_creatable = default_instance_properties.has(class_name);
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
