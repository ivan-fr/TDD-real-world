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
//     const total = ...;
//     const reduction = await gateway.getReductionByCode(code);
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
//   case "FIXED": return total - reduction.amount;
// }
// ============================================================

// ============================================================
// Test 7 : implémentation pour faire passer le test au vert (plancher 1€)
// Use case : CalculatePriceUseCase {
//   ...
//   case "FIXED": return Math.max(total - reduction.amount, 1);
// }
// ============================================================

// ============================================================
// Tests 6-7 : après refactorisation du code (ajout du switch complet)
// Use case : CalculatePriceUseCase {
//   switch(reduction.type) {
//     case "PERCENTAGE": return Math.max(total * (1-amount/100), 0);
//     case "FIXED": return Math.max(total - amount, 1);
//     default: return total;
//   }
// }
// ============================================================

// ============================================================
// Test 8 : implémentation pour faire passer le test au vert (1 acheté = 1 offert)
// Ajout du case "FREE_PRODUCT" dans le switch
// Use case : CalculatePriceUseCase {
//   ...
//   case "FREE_PRODUCT": {
//     let adjusted = 0;
//     for (const p of products) {
//       if (p.type === reduction.productType && p.quantity > 1) {
//         adjusted += p.price * (p.quantity - Math.floor(p.quantity / 2));
//       } else {
//         adjusted += p.price * p.quantity;
//       }
//     }
//     return adjusted;
//   }
// }
// ============================================================

// ============================================================
// Tests 8-10 : après refactorisation du code (FREE_PRODUCT avec conditions)
// Le switch contient maintenant PERCENTAGE, FIXED, FREE_PRODUCT
// ============================================================

// ============================================================
// Test 11 : implémentation pour faire passer le test au vert (pourcentage ciblé par productType)
// Use case : CalculatePriceUseCase {
//   case "PERCENTAGE":
//     if (reduction.productType) {
//       const sub = products.filter(p => p.type === reduction.productType)
//         .reduce((s, p) => s + p.price * p.quantity, 0);
//       return total - sub * (reduction.amount / 100);
//     }
//     return Math.max(total * (1 - reduction.amount / 100), 0);
// }
// ============================================================

// ============================================================
// Tests 12-13 : implémentation pour faire passer le test au vert (condition minAmount)
// Use case : CalculatePriceUseCase {
//   ...
//   if (reduction.minAmount && total < reduction.minAmount) {
//     return total;
//   }
//   switch (reduction.type) { ... }
// }
// ============================================================

// ============================================================
// Tests 14-16 : tests de cas limites (panier vide, sans code, total min 0€)
// Pas de changement du use case, les cas sont déjà gérés.
// ============================================================

// ============================================================
// Test 17 : implémentation pour faire passer le test au vert (Black Friday)
// Ajout du case "BLACK_FRIDAY" dans le switch
// Use case : CalculatePriceUseCase {
//   case "BLACK_FRIDAY": {
//     const start = new Date("2025-11-28T00:00:00");
//     const end = new Date("2025-11-30T23:59:59");
//     if (now >= start && now <= end) {
//       return Math.max(total * 0.5, 1);
//     }
//     return total;
//   }
// }
// ============================================================

// ============================================================
// Tests 17-20 : après refactorisation du code (Black Friday validé)
// Le switch contient PERCENTAGE, FIXED, FREE_PRODUCT, BLACK_FRIDAY
// ============================================================

// ============================================================
// REFACTORISATION MAJEURE : remplacement du switch par le Strategy Pattern
// Chaque case devient une classe qui implémente ReductionStrategy :
//   - PercentageStrategy
//   - FixedStrategy
//   - FreeProductStrategy
//   - BlackFridayStrategy
// Le use case itère sur une liste de réductions via buildStrategies(now)
// ============================================================

// ============================================================
// Test 21 : implémentation pour faire passer le test au vert (combinaison de réductions)
// Use case : CalculatePriceUseCase {
//   La gateway retourne Reduction[] au lieu de Reduction | null
//   execute() itère sur chaque réduction et applique la strategy correspondante
//   for (const reduction of reductions) {
//     const strategy = strategies[reduction.type];
//     if (strategy) total = strategy.apply(total, products, reduction);
//   }
// }
// ============================================================

// ============================================================
// Test 21 : après refactorisation du code
// Use case : version finale avec Strategy Pattern et liste de réductions
// (voir code ci-dessous)
// ============================================================

interface ReductionStrategy {
    apply(total: number, products: Product[], reduction: Reduction): number;
}

class PercentageStrategy implements ReductionStrategy {
    apply(total: number, products: Product[], reduction: Reduction): number {
        if (reduction.productType) {
            const targetSubtotal = products
                .filter((p) => p.type === reduction.productType)
                .reduce((sum, p) => sum + p.price * p.quantity, 0);
            const discount = targetSubtotal * (reduction.amount / 100);
            return total - discount;
        }
        return Math.max(total * (1 - reduction.amount / 100), 0);
    }
}

class FixedStrategy implements ReductionStrategy {
    apply(total: number, _products: Product[], reduction: Reduction): number {
        return Math.max(total - reduction.amount, 1);
    }
}

class FreeProductStrategy implements ReductionStrategy {
    apply(total: number, products: Product[], reduction: Reduction): number {
        let adjustedTotal = 0;
        for (const product of products) {
            if (reduction.productType && product.type === reduction.productType && product.quantity > 1) {
                const freeItems = Math.floor(product.quantity / 2);
                adjustedTotal += product.price * (product.quantity - freeItems);
            } else {
                adjustedTotal += product.price * product.quantity;
            }
        }
        return adjustedTotal;
    }
}

class BlackFridayStrategy implements ReductionStrategy {
    constructor(private now: Date) {}
    apply(total: number, _products: Product[], _reduction: Reduction): number {
        const start = new Date("2025-11-28T00:00:00");
        const end = new Date("2025-11-30T23:59:59");
        if (this.now >= start && this.now <= end) {
            return Math.max(total * 0.5, 1);
        }
        return total;
    }
}

const buildStrategies = (now: Date): Record<string, ReductionStrategy> => ({
    PERCENTAGE: new PercentageStrategy(),
    FIXED: new FixedStrategy(),
    FREE_PRODUCT: new FreeProductStrategy(),
    BLACK_FRIDAY: new BlackFridayStrategy(now),
});

class CalculatePriceUseCase {
    constructor(private reductionGateway: ReductionGateway) { }

    async execute(products: Product[], code?: string, now: Date = new Date()): Promise<number> {
        let total = products.reduce(
            (price, product) => product.price * product.quantity + price,
            0,
        );

        if (!code) {
            return total;
        }

        const reductions = await this.reductionGateway.getReductionByCode(code);

        if (!reductions || reductions.length === 0) {
            return total;
        }

        const strategies = buildStrategies(now);

        for (const reduction of reductions) {
            if (reduction.minAmount && total < reduction.minAmount) {
                continue;
            }

            const strategy = strategies[reduction.type];
            if (strategy) {
                total = strategy.apply(total, products, reduction);
            }
        }

        return total;
    }
}

interface ReductionGateway {
    getReductionByCode(code: string): Promise<Reduction[]>;
}

class StubReductionGateway implements ReductionGateway {
    public reductions: Reduction[] = [];
    getReductionByCode(code: string): Promise<Reduction[]> {
        return Promise.resolve(this.reductions);
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
        reductionGateway.reductions = [aReduction({ type: "PERCENTAGE", amount: 10 })];
        const result = await calculatePrice.execute(
            [aProduct({ price: 100, name: "product1" })],
            "PROMO10",
        );
        expect(result).toBe(90);
    });

    // ===================== TEST 5 : Réduction pourcentage 50% =====================
    test("For 50% reduction on 80€ basket", async () => {
        reductionGateway.reductions = [aReduction({ type: "PERCENTAGE", amount: 50 })];
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
        reductionGateway.reductions = [aReduction({ type: "FIXED", amount: 30 })];
        const result = await calculatePrice.execute(
            [aProduct({ price: 100, name: "product1" })],
            "FIXED30",
        );
        expect(result).toBe(70);
    });

    // ===================== TEST 7 : Réduction fixe plancher 1€ =====================
    test("Fixed reduction should not go below 1€", async () => {
        reductionGateway.reductions = [aReduction({ type: "FIXED", amount: 30 })];
        const result = await calculatePrice.execute(
            [aProduct({ price: 20, name: "product1" })],
            "FIXED30",
        );
        expect(result).toBe(1);
    });

    // ===================== TEST 8 : 1 acheté = 1 offert (2 t-shirts) =====================
    test("Buy 2 t-shirts, get 1 free", async () => {
        reductionGateway.reductions = [aReduction({ type: "FREE_PRODUCT", amount: 0, productType: "TSHIRT" })];
        const result = await calculatePrice.execute(
            [aProduct({ price: 20, name: "T-Shirt", quantity: 2, type: "TSHIRT" })],
            "FREETSHIRT",
        );
        expect(result).toBe(20);
    });

    // ===================== TEST 9 : 1 acheté = 1 offert (3 t-shirts) =====================
    test("Buy 3 t-shirts, get 1 free", async () => {
        reductionGateway.reductions = [aReduction({ type: "FREE_PRODUCT", amount: 0, productType: "TSHIRT" })];
        const result = await calculatePrice.execute(
            [aProduct({ price: 20, name: "T-Shirt", quantity: 3, type: "TSHIRT" })],
            "FREETSHIRT",
        );
        expect(result).toBe(40);
    });

    // ===================== TEST 10 : FREE_PRODUCT ne s'applique pas au mauvais type =====================
    test("Free product promo should not apply to wrong type", async () => {
        reductionGateway.reductions = [aReduction({ type: "FREE_PRODUCT", amount: 0, productType: "TSHIRT" })];
        const result = await calculatePrice.execute(
            [aProduct({ price: 40, name: "Pull", quantity: 2, type: "PULL" })],
            "FREETSHIRT",
        );
        expect(result).toBe(80);
    });

    // ===================== TEST 11 : Pourcentage ciblé par productType =====================
    test("Percentage reduction only on t-shirts", async () => {
        reductionGateway.reductions = [aReduction({ type: "PERCENTAGE", amount: 10, productType: "TSHIRT" })];
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
        reductionGateway.reductions = [aReduction({ type: "PERCENTAGE", amount: 10, minAmount: 30 })];
        const result = await calculatePrice.execute(
            [aProduct({ price: 20, name: "product1" })],
            "MIN30",
        );
        expect(result).toBe(20);
    });

    // ===================== TEST 13 : Condition minAmount atteint =====================
    test("Should apply reduction if basket reaches minAmount", async () => {
        reductionGateway.reductions = [aReduction({ type: "PERCENTAGE", amount: 10, minAmount: 30 })];
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
        reductionGateway.reductions = [aReduction({ type: "FIXED", amount: 100 })];
        const result = await calculatePrice.execute(
            [aProduct({ price: 5, name: "product1" })],
            "BIGFIXED",
        );
        expect(result).toBe(1);
    });

    // ===================== TEST 17 : Black Friday -50% dates valides =====================
    test("Black Friday applies 50% during valid dates", async () => {
        reductionGateway.reductions = [aReduction({ type: "BLACK_FRIDAY", amount: 50 })];
        const blackFriday = new Date("2025-11-28T12:00:00");
        const result = await calculatePrice.execute(
            [aProduct({ price: 100, name: "product1" })],
            "BLACKFRIDAY",
            blackFriday,
        );
        expect(result).toBe(50);
    });

    // ===================== TEST 18 : Black Friday hors des dates =====================
    test("Black Friday does NOT apply outside valid dates", async () => {
        reductionGateway.reductions = [aReduction({ type: "BLACK_FRIDAY", amount: 50 })];
        const outsideDate = new Date("2025-12-01T12:00:00");
        const result = await calculatePrice.execute(
            [aProduct({ price: 100, name: "product1" })],
            "BLACKFRIDAY",
            outsideDate,
        );
        expect(result).toBe(100);
    });

    // ===================== TEST 19 : Black Friday dernier moment valide =====================
    test("Black Friday applies on last valid moment (Nov 30 23:59)", async () => {
        reductionGateway.reductions = [aReduction({ type: "BLACK_FRIDAY", amount: 50 })];
        const lastMoment = new Date("2025-11-30T23:59:00");
        const result = await calculatePrice.execute(
            [aProduct({ price: 100, name: "product1" })],
            "BLACKFRIDAY",
            lastMoment,
        );
        expect(result).toBe(50);
    });

    // ===================== TEST 20 : Black Friday plancher 1€ =====================
    test("Black Friday should not go below 1€", async () => {
        reductionGateway.reductions = [aReduction({ type: "BLACK_FRIDAY", amount: 50 })];
        const blackFriday = new Date("2025-11-28T12:00:00");
        const result = await calculatePrice.execute(
            [aProduct({ price: 1, name: "product1" })],
            "BLACKFRIDAY",
            blackFriday,
        );
        expect(result).toBe(1);
    });

    // ===================== TEST 21 : Combinaison FREE_PRODUCT + PERCENTAGE + BLACK_FRIDAY =====================
    test("Combines FREE_PRODUCT + PERCENTAGE + BLACK_FRIDAY", async () => {
        reductionGateway.reductions = [
            aReduction({ type: "FREE_PRODUCT", amount: 0, productType: "TSHIRT" }),
            aReduction({ type: "PERCENTAGE", amount: 10 }),
            aReduction({ type: "BLACK_FRIDAY", amount: 50 }),
        ];
        const blackFriday = new Date("2025-11-28T12:00:00");
        const result = await calculatePrice.execute(
            [aProduct({ price: 50, name: "T-Shirt", quantity: 2, type: "TSHIRT" })],
            "COMBO",
            blackFriday,
        );
        // FREE_PRODUCT: 2 t-shirts → 1 offert = 50€
        // PERCENTAGE -10%: 50€ × 0.9 = 45€
        // BLACK_FRIDAY -50%: 45€ × 0.5 = 22.5€
        expect(result).toBe(22.5);
    });
});