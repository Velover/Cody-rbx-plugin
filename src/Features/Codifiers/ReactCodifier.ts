import { InstanceAST } from "../InstanceAST/InstanceAST";

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

		const property_name_exceptions = new Array<string>();

		for (const [, node] of registry) {
			//checks for undefined properties
			//checks for BackgroundTransparency and BackgroundColor3
			//checks for BorderSizePixel and BorderColor3

			for (const diff_property_name of node.DifferentProperties) {
				const property_data = node.Properties.get(diff_property_name)!;
				if (property_data.Readonly) {
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
	}
}
