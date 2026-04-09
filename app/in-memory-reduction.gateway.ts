import { Discount } from "./calcul-price.usecase";
import { ReductionGateway } from "./reduction.gateway";

const DISCOUNT_CODES: Record<string, Discount[]> = {
	BLACKFRIDAY: [{ type: "BLACK_FRIDAY" }],
	ONEFREEPULL: [{ type: "FREE_PRODUCT", productType: "PULL" }],
	DISCOUNTEURO30: [{ type: "FIXED", value: 30 }],
	DISCOUNTEURO10: [{ type: "FIXED", value: 10 }],
	DISCOUNTPERCENT10: [{ type: "PERCENTAGE", value: 10 }],
};

export class InMemoryReductionGateway implements ReductionGateway {
	private reductionCode: string = "";

	setReductionCode(code: string): void {
		this.reductionCode = code;
	}

	async getReductions(): Promise<Discount[]> {
		if (!this.reductionCode) {
			return [];
		}
		return DISCOUNT_CODES[this.reductionCode] || [];
	}
}
