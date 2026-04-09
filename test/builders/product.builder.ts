type ProductType = "TSHIRT" | "PULL";

type Product = {
	price: number;
	name: string;
	quantity: number;
	type?: ProductType;
};

export const aProduct = (overrides: Partial<Product> = {}): Product => ({
	name: "Default Product",
	quantity: 1,
	price: 10,
	...overrides,
});
