import cors from "cors";
import express, { Request, Response } from "express";
import { CalculPriceUseCase, Product } from "../../app/calcul-price.usecase";
import { InMemoryReductionGateway } from "../../app/in-memory-reduction.gateway";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/totalPrice", async (request: Request, response: Response) => {
	try {
		const { products, reductionCode } = request.body as {
			products: Product[];
			reductionCode?: string;
		};

		const reductionGateway = new InMemoryReductionGateway();
		if (reductionCode) {
			reductionGateway.setReductionCode(reductionCode);
		}

		const useCase = new CalculPriceUseCase(reductionGateway);
		const totalPrice = await useCase.execute(products || []);

		response.json(totalPrice);
	} catch (error) {
		console.error("Error calculating price:", error);
		response.status(500).json({ error: "Internal server error" });
	}
});

app.get("/baskets", (request: Request, response: Response) => {
	response.json([]);
});

export default app;
