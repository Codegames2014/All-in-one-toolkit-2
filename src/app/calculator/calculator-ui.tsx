"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CalculatorUI() {
  const [display, setDisplay] = useState("0");
  const [currentValue, setCurrentValue] = useState("");
  const [previousValue, setPreviousValue] = useState("");
  const [operator, setOperator] = useState("");
  const [waitingForOperand, setWaitingForOperand] = useState(true);

  const handleNumberClick = (num: string) => {
    if (waitingForOperand) {
      setCurrentValue(num);
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      const newCurrentValue = currentValue === "0" ? num : currentValue + num;
      setCurrentValue(newCurrentValue);
      setDisplay(newCurrentValue);
    }
  };
  
  const handleDecimalClick = () => {
    if (waitingForOperand) {
        setCurrentValue("0.");
        setDisplay("0.");
        setWaitingForOperand(false);
        return;
    }
    if (!currentValue.includes(".")) {
      setCurrentValue(currentValue + ".");
      setDisplay(currentValue + ".");
    }
  };

  const handleOperatorClick = (op: string) => {
    if (currentValue === "" && previousValue === "") return;

    if (previousValue && operator && !waitingForOperand) {
      calculate();
    } else {
      setPreviousValue(currentValue);
    }
    
    setOperator(op);
    setWaitingForOperand(true);
  };
  
  const calculate = () => {
    if (!previousValue || !operator || currentValue === "") return;
    let result = 0;
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);

    switch (operator) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "*":
        result = prev * current;
        break;
      case "/":
        if (current === 0) {
          setDisplay("Error");
          setCurrentValue("Error");
          return;
        }
        result = prev / current;
        break;
    }
    const resultString = result.toString();
    setDisplay(resultString);
    setCurrentValue(resultString);
    setPreviousValue(resultString);
    setOperator("");
    setWaitingForOperand(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setCurrentValue("");
    setPreviousValue("");
    setOperator("");
    setWaitingForOperand(true);
  };

  const handleEqualsClick = () => {
    if (operator) {
      calculate();
    }
  };
  
  const handleToggleSign = () => {
    if(currentValue && currentValue !== "0") {
        const newValue = (parseFloat(currentValue) * -1).toString();
        setCurrentValue(newValue);
        setDisplay(newValue);
    }
  }
  
  const handlePercent = () => {
      if(currentValue) {
          const newValue = (parseFloat(currentValue) / 100).toString();
          setCurrentValue(newValue);
          setDisplay(newValue);
      }
  }


  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <Input
          readOnly
          value={display}
          className="text-right text-4xl font-mono h-20 pr-4 bg-muted"
          aria-live="polite"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
            <Button variant="secondary" size="lg" className="text-xl" onClick={handleClear}>C</Button>
            <Button variant="secondary" size="lg" className="text-xl" onClick={handleToggleSign}>+/-</Button>
            <Button variant="secondary" size="lg" className="text-xl" onClick={handlePercent}>%</Button>
            <Button variant="destructive" size="lg" className="text-xl" onClick={() => handleOperatorClick("/")}>÷</Button>
            
            <Button variant="outline" size="lg" className="text-xl" onClick={() => handleNumberClick("7")}>7</Button>
            <Button variant="outline" size="lg" className="text-xl" onClick={() => handleNumberClick("8")}>8</Button>
            <Button variant="outline" size="lg" className="text-xl" onClick={() => handleNumberClick("9")}>9</Button>
            <Button variant="destructive" size="lg" className="text-xl" onClick={() => handleOperatorClick("*")}>×</Button>
            
            <Button variant="outline" size="lg"className="text-xl" onClick={() => handleNumberClick("4")}>4</Button>
            <Button variant="outline" size="lg" className="text-xl" onClick={() => handleNumberClick("5")}>5</Button>
            <Button variant="outline" size="lg" className="text-xl" onClick={() => handleNumberClick("6")}>6</Button>
            <Button variant="destructive" size="lg" className="text-xl" onClick={() => handleOperatorClick("-")}>-</Button>
            
            <Button variant="outline" size="lg" className="text-xl" onClick={() => handleNumberClick("1")}>1</Button>
            <Button variant="outline" size="lg" className="text-xl" onClick={() => handleNumberClick("2")}>2</Button>
            <Button variant="outline" size="lg" className="text-xl" onClick={() => handleNumberClick("3")}>3</Button>
            <Button variant="destructive" size="lg" className="text-xl" onClick={() => handleOperatorClick("+")}>+</Button>
            
            <Button variant="outline" size="lg" className="col-span-2 text-xl" onClick={() => handleNumberClick("0")}>0</Button>
            <Button variant="outline" size="lg" className="text-xl" onClick={handleDecimalClick}>.</Button>
            <Button variant="default" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl" onClick={handleEqualsClick}>=</Button>
        </div>
      </CardContent>
    </Card>
  );
}
