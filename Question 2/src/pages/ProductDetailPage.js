import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
const DetailContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const ProductTitle = styled.h1`
  font-size: 2rem;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 20px;
`;

const ProductImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ProductInfo = styled.p`
  font-size: 1.1rem;
  margin-bottom: 10px;

  &.bold {
    font-weight: bold;
  }
`;

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/categories/Laptop/products/${productId}`
      );
      setProduct(response.data);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

  if (!product) return <div>Loading...</div>;

  const randomImageUrl = `https://picsum.photos/seed/${product.id}/600/400`;

  return (
    <DetailContainer>
      <ProductTitle>{product.name}</ProductTitle>
      <ProductImage src={randomImageUrl} alt={product.name} />
      <ProductInfo className="bold">Price: Rs.{product.price}</ProductInfo>
      <ProductInfo className="bold">Rating: {product.rating}</ProductInfo>
      <ProductInfo className="bold">Discount: {product.discount}%</ProductInfo>
      <ProductInfo className="bold">
        Availability: {product.availability}
      </ProductInfo>
    </DetailContainer>
  );
};

export default ProductDetailPage;
