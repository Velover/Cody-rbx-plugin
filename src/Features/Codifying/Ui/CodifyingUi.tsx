import { useFlameworkDependency } from "@rbxts/flamework-react-utils";
import React, { useMemo, useState } from "@rbxts/react";
import { CodifyingController } from "../Controllers/CodifyingController";
import { CodifyingResources } from "../Resources/CodifyingResources";
import { Checkbox } from "./Components/Checkbox";
import { CodifyButton } from "./Components/CodifyButton";
import { InstanceItem } from "./Components/InstanceItem";
import { OutputWindow } from "./Components/OutputWindow";

export function CodifyingUi() {
	const codifyingController = useFlameworkDependency<CodifyingController>();
	const instanceTree = codifyingController.useSelectedInstanceTree();
	const [outputText, setOutputText] = useState("");
	const [usePrint, setUsePrint] = useState(false);

	const amount_above_limit = instanceTree.size() > CodifyingResources.MAX_DISPLAYED_INSTANCES;

	const selected_instances = useMemo(() => {
		return instanceTree.map((data) => data.Instance);
	}, [instanceTree]);

	// Get exceptions from controller
	const exceptions = codifyingController.useExceptions(selected_instances);

	// Toggle instance exception
	const toggleException = (instance: Instance) => {
		if (exceptions.includes(instance)) {
			codifyingController.RemoveException(instance);
			return;
		}
		codifyingController.AddException(instance);
	};

	// Handle codify action
	const handleCodify = () => {
		// Get instances excluding exceptions
		const instances = instanceTree
			.filter((data) => !full_exceptions_set.has(data.Instance))
			.map((data) => data.Instance);

		if (instances.size() === 0) {
			setOutputText("// No instances selected for codifying");
			return;
		}

		// Get code from controller
		const code = codifyingController.CodifyInstances(instances);

		const size_bigger_than_200k = code.size() >= 200000;

		if (usePrint || size_bigger_than_200k) {
			print(code);
			setOutputText("// Code printed to output");
		} else {
			setOutputText(code);
		}
	};

	const full_exceptions_set = useMemo(() => {
		const full_exceptions = new Set<Instance>(exceptions);
		for (const exception of exceptions) {
			for (const descendant of exception.GetDescendants()) {
				full_exceptions.add(descendant);
			}
		}
		return full_exceptions;
	}, [selected_instances, exceptions]);

	return (
		<frame
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={CodifyingResources.COLORS.BACKGROUND}
			BorderSizePixel={0}
		>
			<uipadding
				PaddingLeft={new UDim(0, CodifyingResources.SIZES.PADDING)}
				PaddingRight={new UDim(0, CodifyingResources.SIZES.PADDING)}
				PaddingTop={new UDim(0, CodifyingResources.SIZES.PADDING)}
				PaddingBottom={new UDim(0, CodifyingResources.SIZES.PADDING)}
			/>

			<uilistlayout
				Padding={new UDim(0, CodifyingResources.SIZES.PADDING)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				FillDirection={Enum.FillDirection.Vertical}
			/>

			{/* Header section */}
			<frame Size={new UDim2(1, 0, 0, 30)} BackgroundTransparency={1} LayoutOrder={1}>
				<textlabel
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					Text={`Selected Instances: ${instanceTree.size()}`}
					TextSize={14}
					FontFace={CodifyingResources.FONTS.BOLD}
					TextColor3={CodifyingResources.COLORS.TEXT_PRIMARY}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
			</frame>

			{/* Instance list */}
			<frame
				Size={new UDim2(1, 0, 0.5, -75)}
				BackgroundColor3={CodifyingResources.COLORS.INSTANCE_ITEM_BACKGROUND}
				BorderColor3={CodifyingResources.COLORS.BORDER}
				BorderSizePixel={CodifyingResources.SIZES.BORDER_SIZE}
				LayoutOrder={2}
			>
				<uicorner CornerRadius={new UDim(0, CodifyingResources.SIZES.CORNER_RADIUS)} />

				<scrollingframe
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
					ScrollBarImageColor3={CodifyingResources.COLORS.BORDER}
					ScrollBarThickness={8}
					CanvasSize={
						new UDim2(1, 0, 0, instanceTree.size() * CodifyingResources.SIZES.INSTANCE_ITEM_HEIGHT)
					}
					AutomaticCanvasSize={Enum.AutomaticSize.Y}
				>
					<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />

					{!amount_above_limit &&
						instanceTree.map((data, index) => (
							<InstanceItem
								key={`instance_${index}`}
								instanceData={data}
								isExcluded={full_exceptions_set.has(data.Instance)}
								onToggle={() => toggleException(data.Instance)}
								layoutOrder={index}
							/>
						))}
				</scrollingframe>
			</frame>

			{/* Controls section */}
			<frame Size={new UDim2(1, 0, 0, 40)} BackgroundTransparency={1} LayoutOrder={3}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, CodifyingResources.SIZES.PADDING)}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>

				<Checkbox checked={usePrint} onChange={setUsePrint} label="Print to Output" />

				<CodifyButton onClick={handleCodify} />
			</frame>

			{/* Output section */}
			<OutputWindow outputText={outputText} setOutputText={setOutputText} layoutOrder={4} />
		</frame>
	);
}
