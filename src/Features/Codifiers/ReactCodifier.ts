import { InstanceAST } from "../InstanceAST/InstanceAST";
import { TsValueCodifying } from "../ValueCodifying/TsValueCodifying";

export namespace ReactCodifier {
	export function Codify(ast: InstanceAST.IInstanceAST): string {
		if (ast.Roots.size() === 0) return "[]";
		const registry = ast.Registry;
		const roots = ast.Roots.map((id) => registry.get(id)!);
		for (const root of roots) {
			if (!root.IsCreatable) {
				return `// ${root.ClassName} is not creatable`;
			}
		}

		const node_property_exceptions_map = new Map<number, string[]>();

		for (const [, node] of registry) {
			const property_name_exceptions: string[] = ["Name", "Parent", "Source", "TextureContent"];
			node_property_exceptions_map.set(node.Id, property_name_exceptions);
			//checks for undefined properties
			//remove name
			//remove parent
			//checks for BackgroundTransparency and BackgroundColor3
			//checks for BorderSizePixel and BorderColor3

			for (const diff_property_name of node.DifferentProperties) {
				const property_data = node.Properties.get(diff_property_name)!;
				if (property_data.Readonly) {
					property_name_exceptions.push(diff_property_name);
					continue;
				}

				if (node.Properties.get(diff_property_name)!.Value === undefined) {
					property_name_exceptions.push(diff_property_name);
					continue;
				}

				if (
					diff_property_name === "BackgroundColor3" &&
					node.Properties.get("BackgroundTransparency")?.Value === 1
				) {
					property_name_exceptions.push(diff_property_name);
					continue;
				}

				if (
					diff_property_name === "BorderColor3" &&
					node.Properties.get("BorderSizePixel")?.Value === 0
				) {
					property_name_exceptions.push(diff_property_name);
					continue;
				}
			}
		}

		const fragment_required = roots.size() > 1;

		const result: string[] = [];

		if (fragment_required) {
			result.push("<>");
		}

		for (const root_id of ast.Roots) {
			const root_node = registry.get(root_id)!;
			result.push(NodeToTsx(root_node, registry, node_property_exceptions_map));
		}

		if (fragment_required) {
			result.push("</>");
		}

		return result.join("");
	}

	// Helper function to convert a node to TSX
	function NodeToTsx(
		node: InstanceAST.IInstanceNode,
		registry: Map<number, InstanceAST.IInstanceNode>,
		property_exceptions_map: Map<number, string[]>,
	): string {
		const name = node.Properties.get("Name")!.Value;
		const has_children = node.ChildrenIds.size() > 0;

		const node_property_exceptions = property_exceptions_map.get(node.Id)!;

		const result: string[] = [];

		// Start the tag
		result.push(`<${node.ClassName.lower()}`);

		// Add key attribute
		result.push(` key="${name}"`);

		// Add properties
		for (const prop_name of node.DifferentProperties) {
			if (node_property_exceptions.includes(prop_name)) continue;

			const prop_data = node.Properties.get(prop_name)!;
			const prop_value = TsValueCodifying.Codify(prop_data.Value);

			result.push(` ${prop_name}={${prop_value}}`);
		}

		if (!has_children) {
			result.push(" />");
			return result.join("");
		}
		result.push(">");

		// Process children
		for (const child_id of node.ChildrenIds) {
			const child_node = registry.get(child_id)!;
			result.push(NodeToTsx(child_node, registry, property_exceptions_map));
		}

		// Close opening tag
		result.push(`</${node.ClassName.lower()}>`);

		return result.join("");
	}
}
