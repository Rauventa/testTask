import React, {useEffect, useMemo, useState} from 'react';
import {NumberInput} from "../../../../components";
import {QUOTE_CURRENCY} from "../../../constants";
import {Cancel} from "@material-ui/icons";
import {ITakeProfitRow} from "../../../../interfaces/TakeProfit/TakeProfitInterface";
import block from "bem-cn-lite";

interface TakeProfitRowProps {
  item: ITakeProfitRow,
  errors: any,
  onRemove: (id: number) => void,
  onChange: (id: number, value: number | null, type: string) => void,
}

export const TakeProfitRow = ({
  item,
  errors,
  onRemove,
  onChange
}: TakeProfitRowProps) => {

  const handleChange = (value: number | null, type: string) => {
    onChange(item.id, value, type)
  }

  const b = block("take-profit");

  return (
    <div className={b("inputs")}>
      <NumberInput
        value={item.profitPercent}
        onChange={(value) => handleChange(value, 'profitPercent')}
        decimalScale={2}
        InputProps={{ endAdornment: "%" }}
        variant="underlined"
        error={errors.profitPercent}
      />
      <NumberInput
        value={item.price}
        onChange={(value) => handleChange(value, 'price')}
        decimalScale={2}
        InputProps={{ endAdornment: QUOTE_CURRENCY }}
        variant="underlined"
        error={errors.price}
      />
      <NumberInput
        value={item.sellAmount}
        onChange={(value) => handleChange(value, 'sellAmount')}
        decimalScale={2}
        InputProps={{ endAdornment: "%" }}
        variant="underlined"
        error={errors.amount}
      />
      <div className={b("cancel-icon")} onClick={() => onRemove(item.id)}>
        <Cancel />
      </div>
    </div>
  )
}