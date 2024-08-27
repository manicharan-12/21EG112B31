import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import styled from "styled-components";

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 20px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const AllProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "Laptop",
    company: "",
    rating: 0,
    minPrice: 1,
    maxPrice: 10000,
    availability: "all",
  });
  const [sortBy, setSortBy] = useState("price");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, order, page]);

  const fetchProducts = async () => {
    const { category, minPrice, maxPrice } = filters;
    try {
      const response = await axios.get(
        `http://localhost:5000/categories/${category}/products`,
        {
          params: { n: 10, page, sort_by: sortBy, order, minPrice, maxPrice },
        }
      );
      setProducts(response.data);
      setTotalPages(Math.ceil(response.data.length / 10));
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  return (
    <PageContainer>
      <Title>All Products</Title>
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        setSortBy={setSortBy}
        setOrder={setOrder}
      />
      <ProductGrid>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </PageContainer>
  );
};

export default AllProductsPage;
