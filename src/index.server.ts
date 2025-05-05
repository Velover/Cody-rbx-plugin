import { Flamework } from "@flamework/core";
import { LoadApiDump } from "@rbxts/api-dump-fetcher";
import { LoadModules } from "FlameworkIntegration";
import { SetPlugin } from "Utils/PluginGetting";

SetPlugin(plugin);
LoadApiDump(plugin)
	.catch((err) => {
		throw `Failed to load API dump (Please restart your studio): ${err}`;
	})
	.expect();

LoadModules(script.WaitForChild("Features", 20) as Instance);
Flamework.ignite();
