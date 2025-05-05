import React, { useRef } from "@rbxts/react";
import { CodifyingResources } from "../../Resources/CodifyingResources";
import { Button } from "./Button";

interface OutputWindowProps {
	outputText: string;
	setOutputText: (text: string) => void;
	layoutOrder: number;
}

export function OutputWindow({ outputText, setOutputText, layoutOrder }: OutputWindowProps) {
	const textBoxRef = useRef<TextBox>();

	const handleCopyClick = () => {
		const textbox = textBoxRef.current;
		if (textbox === undefined) return;
		// Temporarily enable text editing to allow selection
		textbox.TextEditable = true;
		textbox.CaptureFocus();
		textbox.SelectionStart = 0;
		textbox.CursorPosition = outputText.size() + 1;

		// Wait for copy operation before disabling edit
		task.delay(0.1, () => {
			textbox.TextEditable = false;
		});
	};

	return (
		<frame
			Size={new UDim2(1, 0, 0.5, -40)}
			BackgroundColor3={CodifyingResources.COLORS.OUTPUT_BACKGROUND}
			BorderColor3={CodifyingResources.COLORS.BORDER}
			BorderSizePixel={CodifyingResources.SIZES.BORDER_SIZE}
			LayoutOrder={layoutOrder}
		>
			<uicorner CornerRadius={new UDim(0, CodifyingResources.SIZES.CORNER_RADIUS)} />

			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				SortOrder={Enum.SortOrder.LayoutOrder}
				Padding={new UDim(0, CodifyingResources.SIZES.PADDING)}
			/>

			<frame Size={new UDim2(1, 0, 0, 30)} BackgroundTransparency={1} LayoutOrder={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					HorizontalAlignment={Enum.HorizontalAlignment.Right}
				/>

				<Button
					text="Copy to Clipboard"
					onClick={handleCopyClick}
					size={UDim2.fromOffset(120, CodifyingResources.SIZES.BUTTON_HEIGHT)}
				/>
			</frame>

			<scrollingframe
				Size={new UDim2(1, 0, 1, -38)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				ScrollBarImageColor3={CodifyingResources.COLORS.BORDER}
				ScrollBarThickness={8}
				CanvasSize={new UDim2()}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
				LayoutOrder={2}
			>
				<uipadding
					PaddingTop={new UDim(0, CodifyingResources.SIZES.PADDING)}
					PaddingBottom={new UDim(0, CodifyingResources.SIZES.PADDING)}
					PaddingLeft={new UDim(0, CodifyingResources.SIZES.PADDING)}
					PaddingRight={new UDim(0, CodifyingResources.SIZES.PADDING)}
				/>

				<textbox
					Text={outputText}
					Size={new UDim2(1, -16, 1, 0)}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Top}
					TextEditable={false}
					ClearTextOnFocus={false}
					TextSize={14}
					FontFace={CodifyingResources.FONTS.REGULAR}
					TextColor3={CodifyingResources.COLORS.TEXT_PRIMARY}
					TextWrapped={true}
					AutomaticSize={Enum.AutomaticSize.Y}
					ref={textBoxRef}
					Change={{
						Text: (rbx) => {
							// Allow controller to update text if needed
							if (rbx.Text !== outputText) {
								setOutputText(rbx.Text);
							}
						},
					}}
				/>
			</scrollingframe>
		</frame>
	);
}
