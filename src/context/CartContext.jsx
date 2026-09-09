import { createContext, useContext, useReducer } from 'react';

// ============================================
// CART CONTEXT — State Management
// ============================================

const CartContext = createContext(null);

const initialState = {
  items: [],
  isOpen: false,
  orderNote: '',
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, qty: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'UPDATE_QTY': {
      if (action.payload.qty <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'SET_NOTE':
      return { ...state, orderNote: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const totalItems  = state.items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice  = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const addItem    = (item) => { dispatch({ type: 'ADD_ITEM', payload: item }); dispatch({ type: 'OPEN_CART' }); };
  const removeItem = (id)   => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQty  = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  const clearCart  = ()     => dispatch({ type: 'CLEAR_CART' });
  const toggleCart = ()     => dispatch({ type: 'TOGGLE_CART' });
  const openCart   = ()     => dispatch({ type: 'OPEN_CART' });
  const closeCart  = ()     => dispatch({ type: 'CLOSE_CART' });
  const setNote    = (note) => dispatch({ type: 'SET_NOTE', payload: note });

  return (
    <CartContext.Provider value={{
      items: state.items,
      isOpen: state.isOpen,
      orderNote: state.orderNote,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      toggleCart,
      openCart,
      closeCart,
      setNote,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
