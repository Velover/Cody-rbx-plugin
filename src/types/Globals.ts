export {};

declare global {
	const SecurityCapabilities: SecurityCapabilitiesConstructor;
}

export interface ReflectedPropertyDisplay {
	Category: string;
	DeprecationMessage?: string;
}

export interface ReflectedPropertyPermits {
	Read?: SecurityCapabilities;
	ReadParallel?: SecurityCapabilities;
	Write?: SecurityCapabilities;
	WriteParallel?: SecurityCapabilities;
}

export interface ReflectedProperty {
	Name: string;
	Owner: string;
	Serialized: boolean;
	Display?: ReflectedPropertyDisplay;
	Permits: ReflectedPropertyPermits;
}

export interface ReflectedClassDisplay {
	Category: string;
	DeprecationMessage?: string;
}

export interface ReflectedClassPermits {
	GetService?: SecurityCapabilities;
	New?: SecurityCapabilities;
}

export interface ReflectedClass {
	Name: string;
	Serialized: boolean;
	Superclass?: string;
	Subclasses: Array<string>;
	Display?: ReflectedClassDisplay;
	Permits: ReflectedClassPermits;
}
