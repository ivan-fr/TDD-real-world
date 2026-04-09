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

// ============================================================
// Test 1 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase {
//   execute(products) {
//     return products[0].price * products[0].quantity;
//   }
// }
// ============================================================

// ============================================================
// Test 2 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase {
//   execute(products) {
//     return products[0].price * products[0].quantity
//          + products[1].price * products[1].quantity;
//   }
// }
// ============================================================

// ============================================================
// Tests 1-3 : après refactorisation du code
// Use case : CalculatePriceUseCase {
//   execute(products) {
//     return products.reduce((total, p) => total + p.price * p.quantity, 0);
//   }
// }
// ============================================================

// ============================================================
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
// ============================================================

// ============================================================
// Tests 4-5 : après refactorisation du code
// Use case : CalculatePriceUseCase {
//   execute(products, code?) {
//     const total = products.reduce((t, p) => t + p.price * p.quantity, 0);
//     if (!code) return total;
//     const reduction = await this.reductionGateway.getReductionByCode(code);
//     if (!reduction) return total;
//     switch (reduction.type) {
//       case "PERCENTAGE":
//         return Math.max(total * (1 - reduction.amount / 100), 0);
//       default: return total;
//     }
//   }
// }
// ============================================================

// ============================================================
// Test 6 : implémentation pour faire passer le test au vert (réduction fixe)
// Use case : CalculatePriceUseCase {
//   ...
//   switch (reduction.type) {
//     case "PERCENTAGE": ...
//     case "FIXED":
//       return total - reduction.amount;
//   }
// }
// ============================================================

// ============================================================
// Test 7 : implémentation pour faire passer le test au vert (plancher 1€ réduction fixe)
// Use case : CalculatePriceUseCase {
//   ...
//   case "FIXED":
//     return Math.max(total - reduction.amount, 1);
// }
// ============================================================

// ============================================================
// Tests 6-7 : après refactorisation du code
// Use case : CalculatePriceUseCase {
//   ...
//   switch (reduction.type) {
//     case "PERCENTAGE":
//       if (reduction.productType) {
//         const sub = products.filter(p => p.type === reduction.productType)
//           .reduce((s, p) => s + p.price * p.quantity, 0);
//         return total - sub * (reduction.amount / 100);
//       }
//       return Math.max(total * (1 - reduction.amount / 100), 0);
//     case "FIXED":
//       return Math.max(total - reduction.amount, 1);
//     default: return total;
//   }
// }
// ============================================================

// ============================================================
// Test 8-10 : ajout condition productType sur la réduction pourcentage
// Use case : CalculatePriceUseCase {
//   ...
//   case "PERCENTAGE":
//     if (reduction.productType) {
//       const targetSubtotal = products
//         .filter(p => p.type === reduction.productType)
//         .reduce((sum, p) => sum + p.price * p.quantity, 0);
//       return total - targetSubtotal * (reduction.amount / 100);
//     }
//     return Math.max(total * (1 - reduction.amount / 100), 0);
// }
// ============================================================

// ============================================================
// Test 11-12 : ajout condition minAmount
// Use case : CalculatePriceUseCase {
//   ...
//   if (reduction.minAmount && total < reduction.minAmount) {
//     return total;
//   }
//   switch (reduction.type) { ... }
// }
// ============================================================

// ============================================================
// Tests 11-12 : après refactorisation du code
// Use case : version finale avec switch (voir code ci-dessous)
// ============================================================

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

		if (reduction.minAmount && total < reduction.minAmount) {
			return total;
		}

		switch (reduction.type) {
			case "PERCENTAGE": {
				if (reduction.productType) {
					const targetSubtotal = products
						.filter((p) => p.type === reduction.productType)
						.reduce((sum, p) => sum + p.price * p.quantity, 0);
					const discount = targetSubtotal * (reduction.amount / 100);
					return total - discount;
				}
				return Math.max(total * (1 - reduction.amount / 100), 0);
			}
			case "FIXED": {
				return Math.max(total - reduction.amount, 1);
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

	// ===================== TEST 1 : Prix brut un produit =====================
	test("For one product", async () => {
		await expect(
			calculatePrice.execute([aProduct({ price: 1, name: "product1" })]),
		).resolves.toBe(1);
	});

	// ===================== TEST 2 : Prix brut deux produits =====================
	test("For two products", async () => {
		await expect(
			calculatePrice.execute([
				aProduct({ price: 1, name: "product1" }),
				aProduct({ price: 1, name: "product2" }),
			]),
		).resolves.toBe(2);
	});

	// ===================== TEST 3 : Prix brut avec quantité =====================
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

	// ===================== TEST 6 : Réduction fixe 30€ =====================
	test("For fixed 30€ reduction on 100€ basket", async () => {
		reductionGateway.reduction = aReduction({ type: "FIXED", amount: 30 });
		const result = await calculatePrice.execute(
			[aProduct({ price: 100, name: "product1" })],
			"FIXED30",
		);
		expect(result).toBe(70);
	});

	// ===================== TEST 7 : Réduction fixe plancher 1€ =====================
	test("Fixed reduction should not go below 1€", async () => {
		reductionGateway.reduction = aReduction({ type: "FIXED", amount: 30 });
		const result = await calculatePrice.execute(
			[aProduct({ price: 20, name: "product1" })],
			"FIXED30",
		);
		expect(result).toBe(1);
	});

	// ===================== TEST 8 : FREE_PRODUCT (à implémenter) =====================
	test.todo("Buy 2 t-shirts, get 1 free");

	// ===================== TEST 9 : FREE_PRODUCT quantité 3 (à implémenter) =====================
	test.todo("Buy 3 t-shirts, get 1 free");

	// ===================== TEST 10 : FREE_PRODUCT mauvais type (à implémenter) =====================
	test.todo("Free product promo should not apply to wrong type");

	// ===================== TEST 11 : Pourcentage ciblé par productType =====================
	test("Percentage reduction only on t-shirts", async () => {
		reductionGateway.reduction = aReduction({ type: "PERCENTAGE", amount: 10, productType: "TSHIRT" });
		const result = await calculatePrice.execute(
			[
				aProduct({ price: 20, name: "T-Shirt", quantity: 2, type: "TSHIRT" }),
				aProduct({ price: 40, name: "Pull", type: "PULL" }),
			],
			"PROMO_TSHIRT",
		);
		expect(result).toBe(76);
	});

	// ===================== TEST 12 : Condition minAmount non atteint =====================
	test("Should not apply reduction if basket is below minAmount", async () => {
		reductionGateway.reduction = aReduction({ type: "PERCENTAGE", amount: 10, minAmount: 30 });
		const result = await calculatePrice.execute(
			[aProduct({ price: 20, name: "product1" })],
			"MIN30",
		);
		expect(result).toBe(20);
	});

	// ===================== TEST 13 : Condition minAmount atteint =====================
	test("Should apply reduction if basket reaches minAmount", async () => {
		reductionGateway.reduction = aReduction({ type: "PERCENTAGE", amount: 10, minAmount: 30 });
		const result = await calculatePrice.execute(
			[aProduct({ price: 30, name: "product1" })],
			"MIN30",
		);
		expect(result).toBe(27);
	});

	// ===================== TEST 14 : Panier vide =====================
	test("Empty basket should return 0", async () => {
		const result = await calculatePrice.execute([]);
		expect(result).toBe(0);
	});

	// ===================== TEST 15 : Sans code promo =====================
	test("No promo code should return gross total", async () => {
		const result = await calculatePrice.execute([
			aProduct({ price: 20, name: "product1" }),
			aProduct({ price: 30, name: "product2", quantity: 2 }),
		]);
		expect(result).toBe(80);
	});

	// ===================== TEST 16 : Total jamais sous 0€ =====================
	test("Total should never go below 0", async () => {
		reductionGateway.reduction = aReduction({ type: "FIXED", amount: 100 });
		const result = await calculatePrice.execute(
			[aProduct({ price: 5, name: "product1" })],
			"BIGFIXED",
		);
		expect(result).toBe(1);
	});
});