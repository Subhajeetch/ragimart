import { Hono } from "hono";
import type Env from "@/types/env";
import { callAE } from "@/utils/callAE";

import { getAccessToken } from "@/utils/manageAEauthTokens";

const aeProduct = new Hono<{ Bindings: Env }>();

aeProduct.get("/product/search", async (c) => {
  try {
    const session = await getAccessToken(c.env);
    
    const data = await callAE(
      c.env,
      "aliexpress.ds.text.search",
      {
        keyWord: "anime-sword",
        local: "en_US",
        countryCode: "US",
        pageSize: 20,
        pageIndex: 1,
        currency: "USD",
      },
      session 
    );
    return c.json(data);
  } catch (error) {
    console.error("Error searching products:", error);
    return c.json({ error: String(error) }, 500);
  }
});


export default aeProduct;