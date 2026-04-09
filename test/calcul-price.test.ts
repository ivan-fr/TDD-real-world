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

// Test 2 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase {
//   execute(products) {
//     return products[0].price * products[0].quantity
//          + products[1].price * products[1].quantity;
//   }
// }

// Tests 1-3 : après refactorisation du code
// Use case : CalculatePriceUseCase {
//   execute(products) {
//     return products.reduce((total, p) => total + p.price * p.quantity, 0);
//   }
// }

class CalculatePriceUseCase {
	constructor(private reductionGateway: ReductionGateway) { }

	async execute(products: Product[], code?: string): Promise<number> {
		return products.reduce(
			(price, product) => product.price * product.quantity + price,
			0,
		);
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
});
