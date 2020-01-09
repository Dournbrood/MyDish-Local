import React, { useState, useRef, useEffect } from "react";
import { TextInput, View, Text, TouchableOpacity, Button } from "react-native";
import { useDispatch } from "react-redux";
import { addIngredient } from "../store/singleRecipe/singleRecipeActions";
// import styles from '../styles/createRecipeStyles';
// import ReactNativePickerModule from 'react-native-picker-module'
import Picker from "./Picker.android";

const Ingredient = ({ recipeIng, recipe, setRecipe, setAdding, parent }) => {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);
    const [highlighted, setHighlighted] = useState({
        name: false,
        quantity: false,
        unit: false,
    });

    const [choices, setChoices] = useState({
        selectedValue: null,
        data: [
            "tsp",
            "tbsp",
            "cup",
            "g",
            "mg",
            "oz",
            "pinch",
            "L",
            "ml",
            "can",
            "whole",
            "pint",
            "package",
            "lbs",
        ],
    });

    useEffect(() => {
        if (recipeIng) {
            setIngredient({
                name: recipeIng.name,
                quantity: String(recipeIng.quantity),
                unit: recipeIng.unit,
            });
        }
    }, [recipeIng]);

    const [ingredient, setIngredient] = useState({
        name: "",
        quantity: "",
        unit: "",
    });
    const [toEdits, setToEdits] = useState([]);

    const nameInput = useRef(null);
    const quantityInput = useRef(null);

    const handleChange = (key, value, i) => {
        setChoices({ ...choices, selectedValue: i });
        setIngredient({ ...ingredient, [key]: value });
    };

    const handleBlur = event => {
        if (!recipe) return;
        //console.log('handleBlur triggered in <Ingredient/>');
        const ingArr = Object.values(ingredient);
        const fullIng = ingArr.filter(i => !!i);
        if (fullIng.length === 3) {
            setToEdits([...toEdits, ingredient]);
            const recipeIng = [...recipe.ingredients];

            for (let i = 0; i < toEdits.length; i++) {
                for (let j = 0; j < recipeIng.length; j++) {
                    if (toEdits[i].name === recipeIng[j].name) {
                        recipeIng.splice(j, 1);
                    }
                }
            }
            setRecipe({ ...recipe, ingredients: [...recipeIng, ingredient] });
        }
    };

    const cancelAdd = () => {
        setHighlighted({ name: false, quantity: false, unit: false });
        setAdding(false);
    };

    const submitAdd = () => {
        const lengthObj = {
            name: !ingredient.name.length,
            quantity: !ingredient.quantity.length,
            unit: !ingredient.unit.length,
        };

        if (Object.values(lengthObj).find(x => !!x)) {
            setHighlighted(lengthObj);
            console.log("HIGHLIGHT TEST:", highlighted);
        } else {
            setAdding(false);
            dispatch(addIngredient(ingredient));
        }
    };

    return (
        <View>
            <View
                style={{
                    flexDirection: "row",
                    marginBottom: 20,
                    justifyContent: "space-evenly",
                    width: "100%",
                }}
            >
                <TextInput
                    ref={nameInput}
                    style={{
                        height: 40,
                        width: "50%",
                        borderWidth: highlighted.name ? 1 : 0.8,
                        borderColor: highlighted.name ? "#FF0000" : "#363838",
                        borderRadius: 4,
                        textAlign: "center",
                    }}
                    placeholder="Ingredient Name"
                    onChangeText={event => handleChange("name", event)}
                    returnKeyType="done"
                    onBlur={handleBlur}
                    value={ingredient.name}
                    onSubmitEditing={() => quantityInput.current.focus()}
                />
                <TextInput
                    ref={quantityInput}
                    style={{
                        height: 40,
                        width: "20%",
                        borderWidth: highlighted.quantity ? 1 : 0.8,
                        borderColor: highlighted.quantity
                            ? "#FF0000"
                            : "#363838",
                        borderRadius: 4,
                        textAlign: "center",
                    }}
                    placeholder="Amount"
                    keyboardType={"numeric"}
                    onChangeText={qty =>
                        handleChange(
                            "quantity",
                            isNaN(Number(qty)) ? ingredient.quantity : qty,
                        )
                    }
                    returnKeyType="done"
                    onBlur={handleBlur}
                    value={ingredient.quantity}
                    onSubmitEditing={() => setVisible(true)}
                />

                <Picker
                    choices={choices}
                    handleChange={handleChange}
                    ingredient={ingredient}
                    setVisible={setVisible}
                    visible={visible}
                    setIngredient={setIngredient}
                    highlighted={highlighted}
                />
            </View>
            {parent === "AddIngredient" && (
                <View
                    style={{
                        flexDirection: "row",
                        width: "100%",
                        justifyContent: "space-evenly",
                    }}
                >
                    <Button title="Cancel" onPress={cancelAdd} />
                    <Button title="Submit" onPress={submitAdd} />
                </View>
            )}
        </View>
    );
};

export default Ingredient;
