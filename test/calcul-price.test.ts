import { aProduct } from "./builders/product.builder";
import { aReduction } from "./builders/discount.builder";

type ProductType = "TSHIRT" | "PULL";

type Product = {
	price: number;
	name: string;
	quantity: number;
	type?: ProductType;
};

type Reduction = {
	type: string;
	amount: number;
	productType?: ProductType;
	minAmount?: number;
};

// Test 1 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase {
//   execute(products) {
//     return products[0].price * products[0].quantity;
//   }
// }

// Tests 1-3 : après refactorisation du code
// Use case : CalculatePriceUseCase {
//   execute(products) {
//     return products.reduce((total, p) => total + p.price * p.quantity, 0);
//   }
// }

// Test 4 : implémentation pour faire passer le test au vert (réduction pourcentage)
// Use case : CalculatePriceUseCase {
//   execute(products, code?) {
//     const total = products.reduce((t, p) => t + p.price * p.quantity, 0);
//     if (!code) return total;
//     const reduction = await this.reductionGateway.getReductionByCode(code);
//     if (!reduction) return total;
//     if (reduction.type === "PERCENTAGE") {
//       return total * (1 - reduction.amount / 100);
//     }
//     return total;
//   }
// }

// Tests 4-5 : après refactorisation du code
// Use case : CalculatePriceUseCase {
//   switch (reduction.type) {
//     case "PERCENTAGE":
//       return Math.max(total * (1 - reduction.amount / 100), 0);
//     default: return total;
//   }
// }

class CalculatePriceUseCase {
	constructor(private reductionGateway: ReductionGateway) { }

	async execute(products: Product[], code?: string): Promise<number> {
		const total = products.reduce(
			(price, product) => product.price * product.quantity + price,
			0,
		);

		if (!code) {
			return total;
		}

		const reduction = await this.reductionGateway.getReductionByCode(code);

		if (!reduction) {
			return total;
		}

		switch (reduction.type) {
			case "PERCENTAGE": {
				return Math.max(total * (1 - reduction.amount / 100), 0);
			}
			default:
				return total;
		}
	}
}

interface ReductionGateway {
	getReductionByCode(code: string): Promise<Reduction | null>;
}

class StubReductionGateway implements ReductionGateway {
	public reduction: Reduction | null = null;
	getReductionByCode(code: string): Promise<Reduction | null> {
		return Promise.resolve(this.reduction);
	}
}

describe("CalculatePriceUseCase", () => {
	let reductionGateway: StubReductionGateway;
	let calculatePrice: CalculatePriceUseCase;
	beforeEach(() => {
		reductionGateway = new StubReductionGateway();
		calculatePrice = new CalculatePriceUseCase(reductionGateway);
	});

	test("For one product", async () => {
		await expect(
			calculatePrice.execute([aProduct({ price: 1, name: "product1" })]),
		).resolves.toBe(1);
	});

	test("For two products", async () => {
		await expect(
			calculatePrice.execute([
				aProduct({ price: 1, name: "product1" }),
				aProduct({ price: 1, name: "product2" }),
			]),
		).resolves.toBe(2);
	});

	test("For two products with quantity", async () => {
		await expect(
			calculatePrice.execute([
				aProduct({ price: 1, name: "product1" }),
				aProduct({ price: 1, name: "product2", quantity: 2 }),
			]),
		).resolves.toBe(3);
	});

	// ===================== TEST 4 : Réduction pourcentage 10% =====================
	test("For one product with percentage reduction", async () => {
		reductionGateway.reduction = aReduction({ type: "PERCENTAGE", amount: 10 });
		const result = await calculatePrice.execute(
			[aProduct({ price: 100, name: "product1" })],
			"PROMO10",
		);
		expect(result).toBe(90);
	});

	// ===================== TEST 5 : Réduction pourcentage 50% =====================
	test("For 50% reduction on 80€ basket", async () => {
		reductionGateway.reduction = aReduction({ type: "PERCENTAGE", amount: 50 });
		const result = await calculatePrice.execute(
			[
				aProduct({ price: 20, name: "T-Shirt", quantity: 2 }),
				aProduct({ price: 40, name: "Pull" }),
			],
			"PROMO50",
		);
		expect(result).toBe(40);
	});
});
