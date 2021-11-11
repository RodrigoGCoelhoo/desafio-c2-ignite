import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
        await api.get("stock/" + productId).then(async (response) => {
          const stockItemAmount = response.data.amount;
          let cartTemp = cart
          let flagFound = true

          cartTemp.forEach((product: Product) => {
            if (product.id === productId) {
              if (product.amount < stockItemAmount){
                product.amount += 1
              } else {
                toast.error('Quantidade solicitada fora de estoque');
              }
              flagFound = false
            }
          })

          if (flagFound) {
            await api.get("products/" + productId)
            .then(response => {
              const product = response.data
              product.amount = 1
              cartTemp.push(product)
            })
          }

          setCart(cartTemp)
          localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartTemp))
        })

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    let flag = false
    cart.forEach((product) => {
      if (product.id === productId) {
        flag = true
      }
    })
    if (flag) {
      try {
        const cartTemp = cart
        cartTemp.forEach((product) => {
          if (product.id === productId) {
            const index = cartTemp.indexOf(product)
            cartTemp.splice(index, 1)
          }
        })
        setCart(cartTemp)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartTemp))
      } catch {
        toast.error('Erro na remoção do produto');
      }
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

      if (amount <= 0) {
        return;
      }

      await api.get("stock/" + productId).then(response => {
        const stockItemAmount = response.data.amount;

        if (amount <= stockItemAmount) {
          let newCart = cart
          newCart.forEach((product: Product) => {
            if (product.id === productId) {
              product.amount = amount
            }
          })
          setCart(newCart)
          localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart))
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      })

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
