const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const PORT = 5000;
const AUTH_URL = "http://20.244.56.144/test/auth";
const BASE_URL = "http://20.244.56.144/test/companies";
const COMPANIES = ["AMZ", "FLP", "SNP", "MYN", "AZO"];

const authData = {
  companyName: "affordmed",
  clientID: "546e0ea2-a7b3-4a93-9368-267ac7fd5729",
  clientSecret: "hKiviNrTWjxPsVKo",
  ownerName: "Mani Charan Reddy Gade",
  ownerEmail: "21eg112b31@anurag.edu.in",
  rollNo: "21EG112B31",
};

let productCache = {};
let bearerToken = null;
let tokenExpirationTime = 0;

const generateProductId = (product) => {
  return crypto.createHash("md5").update(JSON.stringify(product)).digest("hex");
};

app.use(cors());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const getBearerToken = async () => {
  if (bearerToken && Date.now() < tokenExpirationTime) {
    return bearerToken;
  }

  try {
    const response = await axios.post(AUTH_URL, authData);
    bearerToken = response.data.access_token;
    // Set token expiration time (assuming the token is valid for 1 hour)
    tokenExpirationTime = Date.now() + 3600000;
    console.log("New token fetched:", bearerToken);
    return bearerToken;
  } catch (error) {
    console.error("Failed to fetch bearer token:", error);
    throw error;
  }
};

app.get("/categories/:categoryname/products", async (req, res) => {
  const { categoryname } = req.params;
  const {
    n = 10,
    page = 1,
    sort_by,
    order = "asc",
    minPrice = 1,
    maxPrice = 10000,
  } = req.query;

  try {
    const token = await getBearerToken();

    const requests = COMPANIES.map((company) => {
      return axios.get(
        `${BASE_URL}/${company}/categories/${categoryname}/products?top=${n}&minPrice=${minPrice}&maxPrice=${maxPrice}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    });

    const responses = await Promise.all(requests);
    let products = responses.flatMap((response) => response.data);

    products = products.map((product) => {
      const id = generateProductId(product);
      productCache[id] = product;
      return { ...product, id };
    });

    if (sort_by) {
      products.sort((a, b) => {
        if (order === "asc") {
          return a[sort_by] > b[sort_by] ? 1 : -1;
        } else {
          return a[sort_by] < b[sort_by] ? 1 : -1;
        }
      });
    }

    const startIndex = (page - 1) * n;
    const paginatedProducts = products.slice(startIndex, startIndex + n);

    res.json(paginatedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/categories/:categoryname/products/:productid", (req, res) => {
  const { productid } = req.params;
  const product = productCache[productid];

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
