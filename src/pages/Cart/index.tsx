import React, { useState, useEffect } from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
  subTotal: string;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();
  const [cartFormatted, setCartFormatted] = useState<ProductFormatted[]>([]);

  function newCartFormatted() {
    const cartFormattedTemp = cart.map((product) => {
      const { id, title, price, image, amount } = product
      const priceFormatted = formatPrice(product.price)
      const subTotal = formatPrice(product.amount * product.price)
      return { id, title, price, image, amount, priceFormatted, subTotal }
    })
    setCartFormatted(cartFormattedTemp)
  }

  useEffect(() => {
    newCartFormatted()
  }, [])

  const total = formatPrice(cart.reduce((sumTotal, product) => {
    sumTotal += product.amount * product.price
    return sumTotal
  }, 0)
  )

  async function handleProductIncrement(product: Product) {
    const { id, amount } = product
    await updateProductAmount({ productId: id, amount: amount + 1 })
    newCartFormatted()
  }

  async function handleProductDecrement(product: Product) {
    const { id, amount } = product
    await updateProductAmount({ productId: id, amount: amount - 1 })
    newCartFormatted()
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
    newCartFormatted()
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map((product) => {
            return (
              <tr data-testid="product" key={product.id}>
                <td>
                  <img src={product.image} alt={product.title} />
                </td>
                <td>
                  <strong>{product.title}</strong>
                  <span>{product.priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                    disabled={product.amount <= 1}
                    onClick={() => handleProductDecrement(product)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={product.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                    onClick={() => handleProductIncrement(product)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{product.subTotal}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                  onClick={() => handleRemoveProduct(product.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            )
          })}

        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
