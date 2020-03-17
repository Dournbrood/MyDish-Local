import React, { useState } from "react";
import {
    Text,
    TextInput,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../store/singleRecipe/singleRecipeActions";
import styles from "../styles/createRecipeStyles";
import theme from "../styles/theme.style";

import RecipeName from "./RecipeName";
import Ingredient from "./Ingredient";
import Instruction from "./Instruction";
import TagButton from "./TagButton";
import Add from "./Add";
import Notes from "./Notes";
import RecipeShareLogo from "./RecipeShareLogo";
import RecipeImage from "./RecipeImageComponents/RecipeImage";
import ImageUploadModal from "./RecipeImageComponents/ImageUploadModal";
import CommitModal from "./EditRecipeComponents/Modal";

import axiosWithAuth from "../utils/axiosWithAuth";
import postImage from "./RecipeImageComponents/postImage";
import { validateFields } from "../utils/helperFunctions/vaildateFields";

//Analytics
import { Analytics, Event } from "expo-analytics";
const analytics = new Analytics("UA-160806654-1");

function CreateRecipeForm({
    navigation,
    savedRecipe,
    cancelButtonEditedRecipe,
    saveButtonEditedRecipe,
}) {
    const dispatch = useDispatch();
    const emptyIngredient = {
        name: "",
        quantity: "",
        units: "",
    };
    const initialFormState = {
        img: "",
        title: "",
        prep_time: "",
        cook_time: "",
        tags: [],
        ingredients: new Array(3).fill(emptyIngredient),
        instructions: new Array(3).fill(""),
        notes: [""],
    };
    const savedRecipeTagNames =
        savedRecipe && savedRecipe.tags.map(tag => tag.name);

    const [recipe, setRecipe] = useState(initialFormState);
    const recipeToRender = savedRecipe
        ? useSelector(state => state.singleRecipe.recipe)
        : recipe;
    const [editRecipe, create] = ["editRecipe", "create"];
    let [errors, setErrors] = useState([]);
    const [commitModal, setCommitModal] = useState({
        save: false,
        cancel: false,
    });
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [highlighted, setHighlighted] = useState({
        prep_time: false,
        cook_time: false,
    });

    const courses = [
        "Breakfast",
        "Brunch",
        "Lunch",
        "Dinner",
        "Dessert",
        "Snack",
    ];

    const cleanUpRecipe = async () => {
        return {
            ...recipe,
            // Remove any ingredients that are empty
            ingredients: recipe.ingredients
                .filter(ing => ing.name.length && ing.quantity && ing.units)
                .map(ing => ({ ...ing, name: ing.name.replace(/\n+/g, " ") })), //Remove any newlines
            instructions: recipe.instructions
                .filter(step => step.length) // Remove empty instructions
                .map((step, i) => ({
                    step_number: i + 1, // Add the step number
                    description: step.replace(/\n+/g, " "), // Remove any newlines
                })),
            notes: recipe.notes
                .filter(note => note.length) // Remove empty instructions
                .map(
                    (note, i) => note.replace(/\n+/g, " "), // Remove any newlines
                ),
            author_comment: "Original Recipe",
            img: recipe.img
                ? await postImage(recipe.img, serverErrorAlert)
                : "",
        };
    };

    const postRecipe = async () => {
        analytics
            .event(new Event("Recipe", "Create recipe"))
            .then(() => console.log("Recipe added"))
            .catch(e => console.log(e.message));
        const postRecipe = await cleanUpRecipe();

        const errMessages = validateFields(postRecipe, courses);

        if (errMessages.length) {
            setErrors(errMessages);
            return; //if any missing fields exists, do not submit the data and set the errors state variable array.
        }
        setIsLoading(true);
        try {
            const axiosCustom = await axiosWithAuth();
            const res = await axiosCustom.post("recipes", postRecipe);

            recipeID = res.data.id;
            setIsLoading(false);
            navigation.navigate("IndividualR", { recipe, recipeID });
        } catch (err) {
            console.log("error from adding new recipe \n", err.response);
            if (err.response.status === 500) {
                serverErrorAlert();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const serverErrorAlert = () => {
        return Alert.alert(
            "Sorry",
            "There was an error when trying to create your recipe. Please try again.",
            [{ text: "Okay" }],
        );
    };

    const addIng = () => {
        const newIng = { name: "", quantity: "", units: "" };
        savedRecipe
            ? dispatch(actions.addIngredient(newIng))
            : setRecipe(oldRecipe => ({
                  ...oldRecipe,
                  ingredients: [...oldRecipe.ingredients, newIng],
              }));
    };

    const addInstruction = () => {
        setRecipe(oldRecipe => ({
            ...oldRecipe,
            instructions: [...oldRecipe.instructions, ""],
        }));
    };

    const addNote = () => {
        setRecipe(oldRecipe => ({
            ...oldRecipe,
            notes: [...oldRecipe.notes, ""],
        }));
    };

    const removeNote = index => {
        setRecipe(oldRecipe => ({
            ...oldRecipe,
            notes: oldRecipe.notes.filter((val, i) => i !== index),
        }));
    };

    const removeIng = index => {
        setRecipe(oldRecipe => ({
            ...oldRecipe,
            ingredients: oldRecipe.ingredients.filter((val, i) => i !== index),
        }));
    };

    const removeInstruction = index => {
        setRecipe(oldRecipe => ({
            ...oldRecipe,
            instructions: oldRecipe.instructions.filter(
                (val, i) => i !== index,
            ),
        }));
    };

    const addIngredients = () => {
        return recipeToRender.ingredients.map((ingredient, i) => (
            <Ingredient
                key={i}
                index={i}
                removeIng={removeIng}
                recipeIng={ingredient}
                recipe={recipe}
                setRecipe={setRecipe}
                parent={savedRecipe ? editRecipe : create}
            />
        ));
    };

    const addInstructions = () => {
        return recipeToRender.instructions.map((instruction, i) => (
            <Instruction
                key={i}
                index={i}
                removeInstruction={removeInstruction}
                instruction={instruction.description}
                setRecipe={setRecipe}
                parent={savedRecipe ? editRecipe : create}
            />
        ));
    };

    const addNotes = () => {
        return recipeToRender.notes.map((note, i) => (
            <Notes
                key={i}
                index={i}
                removeNote={removeNote}
                note={note.description}
                setRecipe={setRecipe}
            />
        ));
    };

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                }}
            >
                <RecipeShareLogo />
                <ActivityIndicator size="large" color="#444444" />
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView>
            <View>
                <ScrollView>
                    <RecipeImage
                        image={recipeToRender.img}
                        setImageModalVisible={setImageModalVisible}
                    />
                    <View style={styles.container}>
                        <View>
                            <CommitModal
                                commitModal={commitModal}
                                setCommitModal={setCommitModal}
                                saveButtonEditedRecipe={saveButtonEditedRecipe}
                            />
                            <ImageUploadModal
                                visible={imageModalVisible}
                                setVisible={setImageModalVisible}
                                setRecipe={setRecipe}
                            />
                            <RecipeName
                                recipe={recipeToRender}
                                setRecipe={setRecipe}
                                missing={errors.includes("title")}
                                parent={savedRecipe ? editRecipe : create}
                            />
                            <View style={styles.totalTimeView}>
                                <View style={styles.timeContainer}>
                                    <View style={styles.heading}>
                                        <Text>Prep Time</Text>
                                        {errors.includes(
                                            "prep_time and/or cook_time",
                                        ) && (
                                            <Text
                                                style={styles.missingAsterisk}
                                            >
                                                *
                                            </Text>
                                        )}
                                    </View>
                                    <TextInput
                                        style={
                                            highlighted.prep_time
                                                ? {
                                                      ...styles.timeInputContainer,
                                                      ...styles.highlighted,
                                                  }
                                                : styles.timeInputContainer
                                        }
                                        placeholder="minutes"
                                        keyboardType={"numeric"}
                                        onChangeText={min => {
                                            if (isNaN(Number(min))) return;
                                            setRecipe({
                                                ...recipe,
                                                prep_time: min,
                                            });
                                        }}
                                        value={String(recipeToRender.prep_time)}
                                        onFocus={() =>
                                            setHighlighted({ prep_time: true })
                                        }
                                        onBlur={() =>
                                            setHighlighted({ prep_time: false })
                                        }
                                    />
                                </View>
                                <View style={styles.timeContainer}>
                                    <View style={styles.heading}>
                                        <Text>Cook Time</Text>
                                        {errors.includes(
                                            "prep_time and/or cook_time",
                                        ) && (
                                            <Text
                                                style={styles.missingAsterisk}
                                            >
                                                *
                                            </Text>
                                        )}
                                    </View>
                                    <TextInput
                                        style={
                                            highlighted.cook_time
                                                ? {
                                                      ...styles.timeInputContainer,
                                                      ...styles.highlighted,
                                                  }
                                                : styles.timeInputContainer
                                        }
                                        placeholder="minutes"
                                        keyboardType={"numeric"}
                                        onChangeText={min => {
                                            if (isNaN(Number(min))) return;
                                            setRecipe({
                                                ...recipe,
                                                cook_time: min,
                                            });
                                        }}
                                        value={String(recipeToRender.cook_time)}
                                        onFocus={() =>
                                            setHighlighted({ cook_time: true })
                                        }
                                        onBlur={() =>
                                            setHighlighted({ cook_time: false })
                                        }
                                    />
                                </View>
                            </View>
                            <View style={styles.heading}>
                                <Text>Course Type</Text>
                                {errors.includes("tags") && (
                                    <Text style={styles.missingAsterisk}>
                                        *
                                    </Text>
                                )}
                            </View>
                            <View style={styles.tagGroup}>
                                {courses.map((course, i) => (
                                    <TagButton
                                        key={i}
                                        tag={course}
                                        isSelected={
                                            savedRecipe
                                                ? savedRecipeTagNames.includes(
                                                      course,
                                                  )
                                                : recipe.tags.includes(course)
                                        }
                                        setRecipe={setRecipe}
                                    />
                                ))}
                            </View>
                            <Text style={{ ...styles.heading, marginTop: 20 }}>
                                Ingredients
                                {errors.includes("ingredients") && (
                                    <Text style={styles.missingAsterisk}>
                                        {" "}
                                        *
                                    </Text>
                                )}
                            </Text>
                            {addIngredients()}
                            <Add text="Add Ingredient" submit={addIng} />

                            <Text style={{ ...styles.heading, marginTop: 20 }}>
                                Instructions
                                {errors.includes("instructions") && (
                                    <Text style={styles.missingAsterisk}>
                                        {" "}
                                        *
                                    </Text>
                                )}
                            </Text>
                            {addInstructions()}
                            <Add text="Add A Step" submit={addInstruction} />

                            <Text style={{ ...styles.heading, marginTop: 20 }}>
                                Notes
                            </Text>

                            {addNotes()}
                            <Add text="Add A Note" submit={addNote} />
                            {errors.length > 0 && (
                                <Text style={styles.errors}>
                                    * Please fill out all required fields.
                                </Text>
                            )}
                            <View style={styles.saveView}>
                                {savedRecipe && (
                                    <TouchableOpacity
                                        onPress={cancelButtonEditedRecipe}
                                    >
                                        <View
                                            style={{
                                                ...styles.btn,
                                                ...styles.cancelBtn,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    ...styles.btnText,
                                                    ...styles.cancelText,
                                                }}
                                            >
                                                Cancel
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={
                                        savedRecipe
                                            ? async () => {
                                                  setCommitModal({
                                                      save: true,
                                                      cancel: false,
                                                  });
                                              }
                                            : postRecipe
                                    }
                                >
                                    <View
                                        style={{
                                            ...styles.btn,
                                            ...styles.saveBtn,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                ...styles.btnText,
                                                ...styles.saveText,
                                            }}
                                        >
                                            Save
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAwareScrollView>
    );
}
CreateRecipeForm.navigationOptions = {
    tabBarLabel: "create new recipe",
    headerTitle: <RecipeShareLogo />,
    headerStyle: { backgroundColor: theme.NAV_BAR_BACKGROUND_COLOR },
};

export default CreateRecipeForm;
