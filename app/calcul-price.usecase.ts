import { ReductionGateway } from "./reduction.gateway";

export type ProductsType = "TSHIRT" | "PULL";

export type Product = {
	name: string;
	quantity: number;
	type: ProductsType;
	price: number;
};

export type DiscountType = "PERCENTAGE" | "FIXED" | "FREE_PRODUCT" | "BLACK_FRIDAY";

export type Discount = {
	type: DiscountType;
	value?: number;
	productType?: ProductsType;
	minAmount?: number;
};

const BLACK_FRIDAY_START = new Date("2025-11-28T00:00:00");
const BLACK_FRIDAY_END = new Date("2025-11-30T23:59:59");

const isBlackFridayActive = (now: Date): boolean => {
	return now >= BLACK_FRIDAY_START && now <= BLACK_FRIDAY_END;
};

const applyFreeProduct = (products: Product[], discount: Discount): Product[] => {
	return products.map((product) => {
		if (discount.productType && product.type !== discount.productType) {
			return product;
		}
		if (product.quantity <= 1) {
			return product;
		}
		const freeItems = Math.floor(product.quantity / 2);
		return { ...product, quantity: product.quantity - freeItems };
	});
};

const computeTotal = (products: Product[]): number => {
	return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
};

const applyPercentageOrFixed = (
	total: number,
	products: Product[],
	discount: Discount,
): number => {
	const rawTotal = computeTotal(products);

	if (discount.minAmount !== undefined && rawTotal < discount.minAmount) {
		return total;
	}

	if (discount.type === "PERCENTAGE") {
		const value = discount.value ?? 0;

		if (discount.productType) {
			const targetSubtotal = products
				.filter((p) => p.type === discount.productType)
				.reduce((sum, p) => sum + p.price * p.quantity, 0);
			const reduction = targetSubtotal * (value / 100);
			return Math.max(total - reduction, 0);
		}

		return Math.max(total * (1 - value / 100), 0);
	}

	if (discount.type === "FIXED") {
		const value = discount.value ?? 0;
		const result = total - value;
		return Math.max(result, 1);
	}

	return total;
};

export class CalculPriceUseCase {
	constructor(private readonly reductionGateway: ReductionGateway) {}

	async execute(products: Product[], now: Date = new Date()): Promise<number> {
		if (products.length === 0) {
			return 0;
		}

		const discounts = await this.reductionGateway.getReductions();

		// Étape 1 : Séparer les types de promos
		const freeProductDiscounts = discounts.filter((d) => d.type === "FREE_PRODUCT");
		const percentageAndFixedDiscounts = discounts.filter(
			(d) => d.type === "PERCENTAGE" || d.type === "FIXED",
		);
		const blackFridayDiscounts = discounts.filter((d) => d.type === "BLACK_FRIDAY");

		// Étape 2 : Appliquer les promos produit (1 acheté = 1 offert)
		let adjustedProducts = [...products];
		for (const discount of freeProductDiscounts) {
			adjustedProducts = applyFreeProduct(adjustedProducts, discount);
		}

		// Étape 3 : Calculer le total après promos produit
		let total = computeTotal(adjustedProducts);

		// Étape 4 : Appliquer les promos fixes/pourcentage
		for (const discount of percentageAndFixedDiscounts) {
			total = applyPercentageOrFixed(total, adjustedProducts, discount);
		}

		// Étape 5 : Appliquer le Black Friday
		for (const discount of blackFridayDiscounts) {
			if (isBlackFridayActive(now)) {
				total = total * 0.5;
				total = Math.max(total, 1);
			}
		}

		return Math.max(total, 0);
	}
}
