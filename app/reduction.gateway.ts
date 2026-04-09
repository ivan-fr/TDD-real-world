import { Discount } from "./calcul-price.usecase";

export interface ReductionGateway {
	getReductions(): Promise<Discount[]>;
}
