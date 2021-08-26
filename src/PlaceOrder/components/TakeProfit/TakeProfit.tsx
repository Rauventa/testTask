/* eslint @typescript-eslint/no-use-before-define: 0 */

import React, {useMemo, useState} from "react";
import block from "bem-cn-lite";
import { AddCircle } from "@material-ui/icons";

import {Button, Switch, TextButton} from "components";

import {BASE_CURRENCY, QUOTE_CURRENCY} from "../../constants";
import { OrderSide } from "../../model";
import "./TakeProfit.scss";
import {useStore} from "../../context";
import {ITakeProfitErrors, ITakeProfitRow} from "../../../interfaces/TakeProfit/TakeProfitInterface";
import {TakeProfitRow} from "./components/TakeProfitRow";

type Props = {
  orderSide: OrderSide;
  // ...
};

const b = block("take-profit");

const TakeProfit = ({ orderSide }: Props) => {

  const {
    price,
    total,
    amount
  } = useStore();

  const defaultFormState: ITakeProfitRow[] = [{
    id: 0,
    profitPercent: 2,
    price: orderSide === 'buy' ?  price + price * 0.02 : price - price * 0.02,
    sellAmount: 100,
  }]

  const [checked, setChecked] = useState<boolean>(false)
  const [formState, setFormState] = useState<ITakeProfitRow[]>(defaultFormState)
  const [formErrors, setFormErrors] = useState<ITakeProfitErrors>({
    profitPercent: '',
    price: '',
    amount: ''
  })

  const handleUpdate = (checked: boolean) => {
    if (!checked) {
      setFormState(defaultFormState)
    }

    setChecked(checked)
  }

  const handleAdd = () => {

    if (formState.length >= 5) return

    const max = formState.reduce((x, y) => x.sellAmount > y.sellAmount ? x : y)
    const formSum = formState.reduce((x, y) => x + y.sellAmount, 0)

    console.log(formSum, max.sellAmount)

    if (formSum > 100) {
      max.sellAmount = (max.sellAmount - formSum) + 100 - 20
    } else {
      max.sellAmount = max.sellAmount - 20
    }

    const prevFormState = formState[formState.length - 1]
    const defaultProfitStep = 2

    const formValue = {
      id: prevFormState.id + 1,
      profitPercent: prevFormState.profitPercent + defaultProfitStep,
      price: orderSide === 'buy' ? price + price * ((prevFormState.profitPercent + defaultProfitStep) / 100) : price - price * ((prevFormState.profitPercent + defaultProfitStep) / 100),
      sellAmount: 20,
    }

    setFormState((prev: any) => {
      prev[max.id] = max
      return [...prev, formValue]
    })
  }

  const handleRemove = (id: number) => {

    if (formState.length < 2) {
      return setChecked(false)
    }

    setFormState(formState.filter((item: ITakeProfitRow) => item.id !== id))
  }

  const handleChange = (id: number, value: number | null, type: string) => {

    const filtered: any = formState.find((item: ITakeProfitRow) => item.id === id)

    if (type === 'profitPercent') {
      filtered.profitPercent = value;
      filtered.price = orderSide === 'buy' ? price + (price*(value || 0)/100) : price - (price*(value || 0)/100)
    }

    if (type === 'price') {
      filtered.profitPercent = ((value || 0) - price)/100
      filtered.price = value
    }

    if (type === 'sellAmount') {
      filtered.sellAmount = value
    }

    setFormState((prev: any) => {
      prev[id] = filtered
      return [...prev]
    })
  }

  const handleSubmit = () => {

    const profitSumChecker = formState.reduce((x, y) => x + y.profitPercent, 0)
    const profitValueChecker = formState.filter((item :ITakeProfitRow) => item.profitPercent <= 0.01)
    const priceValueChecker = formState.filter((item :ITakeProfitRow) => item.price <= 0)
    const amountSumChecker = formState.reduce((x, y) => x + y.sellAmount, 0)
    const isAscending = () => {
      for (let i = 0; i < formState.length; i++) {
        if (i > 0 && formState[i - 1].profitPercent > formState[i].profitPercent) {
          return true;
        }
      }
      return false;
    }

    if (profitSumChecker > 500) {
      setFormErrors((prev: any) => {
        return {
          ...prev,
          profitPercent: 'Maximum profit sum is 500%'
        }
      })
    }

    if (profitValueChecker.length) {
      setFormErrors((prev: any) => {
        return {
          ...prev,
          profitPercent: 'Minimum value is 0.01'
        }
      })
    }

    if (isAscending()) {
      setFormErrors((prev: any) => {
        return {
          ...prev,
          profitPercent: 'Each target\'s profit should be greater than the previous one'
        }
      })
    }

    if (priceValueChecker.length) {
      setFormErrors((prev: any) => {
        return {
          ...prev,
          price: 'Price must be greater than 0'
        }
      })
    }

    if (amountSumChecker > 100) {
      setFormErrors((prev: any) => {
        return {
          ...prev,
          amount: `${amountSumChecker} out of 100% selected. Please decrease by ${amountSumChecker - 100}`
        }
      })
    }
  }

  useMemo(() => {
    const filtered = formState.map((item: ITakeProfitRow) => {
      return {
        ...item,
        price: orderSide === 'buy' ? price + (price * item.profitPercent)/100 : price - (price * item.profitPercent)/100
      }
    })

    setFormState(filtered)
  }, [price])

  const projectedPrice = formState.reduce((x, y) => x + (((y.sellAmount / 100)*(y.price - price)) * amount), 0)

  console.log(formErrors)

  return (
    <div className={b()}>
      <div className={b("switch")}>
        <span>Take profit</span>
        <Switch
          checked={checked}
          onChange={(value: boolean) => handleUpdate(value)}
        />
      </div>
      {checked ?
        <div className={b("content")}>
          {renderTitles()}
          {formState.map((item: ITakeProfitRow, index: number) => {
            return (
              <TakeProfitRow
                item={item}
                errors={formErrors}
                key={index}
                onRemove={handleRemove}
                onChange={handleChange}
              />
            )
          })}
          {formState.length < 5 ?
            <TextButton className={b("add-button")} onClick={handleAdd}>
              <AddCircle className={b("add-icon")} />
              <span>
                Add profit target {formState.length}/5
              </span>
            </TextButton> : null
          }
          <div className={b("projected-profit")}>
            <span className={b("projected-profit-title")}>Projected profit</span>
            <span className={b("projected-profit-value")}>
            <span>{Math.abs(projectedPrice).toFixed(2)}</span>
            <span className={b("projected-profit-currency")}>
              {QUOTE_CURRENCY}
            </span>
          </span>
          </div>
        </div> : null
      }

      <div className={b('submit')}>
        <Button
          color={orderSide === "buy" ? "green" : "red"}
          onClick={() => handleSubmit()}
          fullWidth
        >
          {orderSide === "buy"
            ? `Buy ${BASE_CURRENCY}`
            : `Sell ${QUOTE_CURRENCY}`}
        </Button>
      </div>
    </div>
  );

  function renderTitles() {
    return (
      <div className={b("titles")}>
        <span>Profit</span>
        <span>Trade price</span>
        <span>Amount to {orderSide === "buy" ? "sell" : "buy"}</span>
      </div>
    );
  }
};

export { TakeProfit };
