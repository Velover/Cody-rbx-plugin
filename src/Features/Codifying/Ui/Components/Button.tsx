import React, { PropsWithChildren, useState } from "@rbxts/react";
import { CodifyingResources } from "../../Resources/CodifyingResources";

interface ButtonProps {
	text: string;
	onClick: () => void;
	size?: UDim2;
}

export function Button({
	text,
	onClick,
	size = new UDim2(1, 0, 0, CodifyingResources.SIZES.BUTTON_HEIGHT),
	children,
}: PropsWithChildren<ButtonProps>) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<textbutton
			Text={text}
			Size={size}
			BackgroundColor3={
				isHovered
					? CodifyingResources.COLORS.BUTTON_BACKGROUND_HOVER
					: CodifyingResources.COLORS.BUTTON_BACKGROUND
			}
			TextColor3={CodifyingResources.COLORS.BUTTON_TEXT}
			FontFace={CodifyingResources.FONTS.REGULAR}
			TextSize={14}
			Event={{
				MouseButton1Click: onClick,
				MouseEnter: () => setIsHovered(true),
				MouseLeave: () => setIsHovered(false),
			}}
		>
			<uicorner CornerRadius={new UDim(0, CodifyingResources.SIZES.CORNER_RADIUS)} />
			{children}
		</textbutton>
	);
}
