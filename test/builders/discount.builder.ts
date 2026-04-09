type ProductType = "TSHIRT" | "PULL";

type Reduction = {
	type: string;
	amount: number;
	productType?: ProductType;
	minAmount?: number;
};

export const aReduction = (overrides: Partial<Reduction> = {}): Reduction => ({
	type: "PERCENTAGE",
	amount: 10,
	...overrides,
});
