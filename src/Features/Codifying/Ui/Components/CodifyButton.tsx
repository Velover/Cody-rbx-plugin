import React from "@rbxts/react";
import { Button } from "./Button";

interface CodifyButtonProps {
	onClick: () => void;
}

export function CodifyButton({ onClick }: CodifyButtonProps) {
	return (
		<Button text="Codify Selection" onClick={onClick}>
			<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
		</Button>
	);
}
