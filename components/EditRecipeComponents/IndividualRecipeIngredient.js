import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput } from "react-native";

import styles from "../../styles/individualRecipeStyles";
import { Swipeable } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";
import Ingredient from "../Ingredient";
import {
    startEdit,
    editIngred,
    stopEdit,
    deleteIngredient,
    setCurrentActive,
    resetCurrentActive,
} from "../../store/singleRecipe/singleRecipeActions";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

const IndividualRecipeIngredient = ({ index }) => {
    const dispatch = useDispatch();
    const mainEditing = useSelector(state => state.singleRecipe.editing);
    const ingredients = useSelector(
        state => state.singleRecipe.recipe.ingredients,
    );
    const currentActive = useSelector(
        state => state.singleRecipe.currentActive,
    );
    const recipeIng =
        ingredients && ingredients[index] ? ingredients[index] : {};
    const [editing, setEditing] = useState(false);

    const swipeableEl = useRef(null);

    const close = () => swipeableEl.current.close();

    useEffect(() => {
        // If our mainEditing variable is false,
        // setEditing to false as well.
        // This makes sure that this individual component doesn't also
        //     enter edit mode if we start editing a different swipeale
        if (!mainEditing) {
            setEditing(false);
            dispatch(resetCurrentActive());
        }
    }, [mainEditing]);

    const editHandler = () => {
        setEditing(true);
        dispatch(startEdit());
        close();
    };

    const checkActive = () => {
        if (currentActive.field && currentActive.field !== "ingredient") return;
        if (currentActive.field && currentActive.index !== index) return;
        else {
            return false;
        }
    };

    const makeActive = () => {
        dispatch(setCurrentActive({ field: "ingredient", index, close }));
    };

    const handleWillOpen = () => {
        if (checkActive() !== false) {
            currentActive.close();
        }
        dispatch(stopEdit());
    };

    const handleClose = () => {
        if (checkActive() === false) {
            dispatch(resetCurrentActive());
        }
    };

    return (
        <View style={styles.swipeableContainer}>
            <Swipeable
                ref={swipeableEl}
                onSwipeableWillOpen={handleWillOpen}
                onSwipeableOpen={makeActive}
                onSwipeableClose={handleClose}
                renderRightActions={() => (
                    <View style={styles.buttonContainer}>
                        <View style={styles.editButton}>
                            <FontAwesome
                                name="pencil-square-o"
                                size={20}
                                color="white"
                                onPress={editHandler}
                            />
                        </View>
                        <View style={styles.deleteButton}>
                            <FontAwesome
                                name="trash-o"
                                size={20}
                                color="white"
                                onPress={() => {
                                    dispatch(deleteIngredient(index));
                                    dispatch(resetCurrentActive());
                                }}
                            />
                        </View>
                    </View>
                )}
            >
                {/*Text Input*/}
                {editing && mainEditing ? (
                    <View style={{ marginTop: 10, backgroundColor: "white" }}>
                        <Ingredient
                            index={index}
                            recipeIng={recipeIng}
                            parent="IndividualRecipeIngredient"
                        />
                    </View>
                ) : (
                    <View style={styles.ingredientList}>
                        <View style={styles.ingredientView}>
                            <Text style={styles.ingredientText}>
                                {recipeIng.quantity} {recipeIng.unit}
                            </Text>
                            <MaterialCommunityIcons
                                name="drag-vertical"
                                size={32}
                                color="#2E2E2E"
                            />
                        </View>
                        <View style={styles.ingredientView}>
                            <Text style={styles.ingredientText}>
                                {recipeIng.name}
                            </Text>
                        </View>
                    </View>
                )}
            </Swipeable>
        </View>
    );
};

export default IndividualRecipeIngredient;
