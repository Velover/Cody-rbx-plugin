import { Controller, OnInit, OnStart } from "@flamework/core";
import { atom, peek } from "@rbxts/charm";
import { useEffect, useMemo, useState } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { Selection, StudioService } from "@rbxts/services";
import { InstanceAST } from "../../InstanceAST/InstanceAST";
import { ReactCodifier } from "../../Codifiers/ReactCodifier";

@Controller()
export class CodifyingController implements OnInit, OnStart {
	constructor() {}
	onInit(): void {}
	onStart(): void {}

	public useSelectedInstanceTree(): CodifyingController.InstanceTree {
		const [selected, SetSelected] = useState<Instance[]>([]);
		const selection_serivce = Selection as Selection & { SelectionChanged: RBXScriptSignal };
		useEffect(() => {
			const connection = selection_serivce.SelectionChanged.Connect(() => {
				SetSelected(Selection.Get());
			});
			return () => connection.Disconnect();
		}, []);

		return useMemo(() => {
			const descendants: Instance[] = [];
			for (const instance of selected) {
				descendants.push(instance);
				for (const child of instance.GetDescendants()) {
					descendants.push(child);
				}
			}

			const parent_ref_map = new Map<Instance, Instance>();
			for (const instance of descendants) {
				const parent = instance.Parent;
				if (parent === undefined || !descendants.includes(parent)) continue;
				parent_ref_map.set(instance, parent);
			}

			const GetNestLevel = (instance: Instance): number => {
				let lvl = 0;
				let parent = parent_ref_map.get(instance);
				while (parent !== undefined) {
					lvl += 1;
					parent = parent_ref_map.get(parent);
				}
				return lvl;
			};

			const instance_tree: CodifyingController.InstanceTree = [];
			for (const instance of descendants) {
				const class_name = instance.ClassName;
				const icon_data = this.GetClassNameIcon(class_name);
				const name = instance.Name;
				const nest_level = GetNestLevel(instance);
				instance_tree.push({
					Instance: instance,
					Name: name,
					Icon: icon_data,
					NestLevel: nest_level,
				});
			}

			return instance_tree;
		}, [selected]);
	}

	public AddException(instance: Instance): void {
		this.exceptions_atom_((prev) => [...prev, instance]);
	}

	public RemoveException(instance: Instance): void {
		this.exceptions_atom_((prev) => prev.filter((v) => v !== instance));
	}

	public useExceptions(selected_instances: Instance[]): Instance[] {
		useEffect(() => {
			const value = peek(this.exceptions_atom_);
			const exceptions = value.filter((v) => selected_instances.includes(v));
			if (exceptions.size() === 0) return;
			this.exceptions_atom_((prev) => {
				const new_exceptions = prev.filter((v) => !exceptions.includes(v));
				return new_exceptions;
			});
		}, [selected_instances]);

		return useAtom(this.exceptions_atom_);
	}

	public CodifyInstances(instances: Instance[]): string {
		if (instances.size() === 0) {
			return "// No instances selected for codifying";
		}

		try {
			// Build AST from instances
			const ast = InstanceAST.BuildAst(instances);
			// Use ReactCodifier to convert AST to code
			return ReactCodifier.Codify(ast);
		} catch (err) {
			return `// Error during codification: ${err}`;
		}
	}

	private exceptions_atom_ = atom<Instance[]>([]);
	private cached_class_name_icon_datas = new Map<string, CodifyingController.IInstanceIconData>();
	private GetClassNameIcon(class_name: string): CodifyingController.IInstanceIconData {
		if (this.cached_class_name_icon_datas.has(class_name)) {
			return this.cached_class_name_icon_datas.get(class_name)!;
		}
		const icon_data = (StudioService.GetClassIcon(
			class_name,
		) as CodifyingController.IInstanceIconData) ?? {
			Image: "",
			ImageRectOffset: new Vector2(0, 0),
			ImageRectSize: new Vector2(0, 0),
		};
		this.cached_class_name_icon_datas.set(class_name, icon_data);
		return icon_data;
	}
}

export namespace CodifyingController {
	export type InstanceTree = IInstanceData[];

	export interface IInstanceData {
		Instance: Instance;
		Name: string;
		Icon: IInstanceIconData;
		NestLevel: number;
	}

	export interface IInstanceIconData {
		Image: string;
		ImageRectOffset: Vector2;
		ImageRectSize: Vector2;
	}
}
