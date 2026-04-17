import { Hono } from "hono";
import type Env from "@/types/env";

import config from "@/base.config";

const { AE_API_BASE } = config;

const aeProduct = new Hono<{ Bindings: Env }>();

aeProduct.get("/product/search", (c) => {

    return c.json([
        { id: 1, name: "Product 1", price: 10 },
        { id: 2, name: "Product 2", price: 20 },
        { id: 3, name: "Product 3", price: 30 },
    ]);
});


export default aeProduct;