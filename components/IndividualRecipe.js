import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    SafeAreaView,
    AsyncStorage,
    TouchableOpacity,
    ActivityIndicator,
    ImageBackground,
    Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchRecipe,
    resetRecipe,
    resetCurrentActive,
    stopEditMode,
    startEditMode,
    submitEditedRecipe,
    fetchVersionByRevisionId,
    deleteRecipe,
    resetAlerts,
} from "../store/singleRecipe/singleRecipeActions";

import styles from "../styles/individualRecipeStyles.js";
import theme from "../styles/theme.style";

import clock from "../assets/timer.png";
import logo from "../assets/background.png";
import { savedPlaceholder } from "../constants/imagePlaceholders";
import { maxUsername } from "../constants/maxLenth";

import Title from "./EditRecipeComponents/Title";
import Tab from "./Tab";
import CreateRecipeForm from "./CreateRecipeForm";
import IndividualRecipeIngredient from "./EditRecipeComponents/IndividualRecipeIngredient";
import AddIngredient from "./AddRecipeFields/AddIngredient";
import IndividualRecipeInstruction from "./EditRecipeComponents/IndividualRecipeInstruction";
import AddInstruction from "./AddRecipeFields/AddInstruction";
import IndividualRecipeNotes from "./EditRecipeComponents/IndividualRecipeNotes";
import AddNote from "./AddRecipeFields/AddNote";
import DisplayRecipeIngredient from "./DisplayRecipeComponents/DisplayRecipeIngredient";
import DisplayRecipeInstruction from "./DisplayRecipeComponents/DisplayRecipeInstruction";
import DisplayRecipeNotes from "./DisplayRecipeComponents/DisplayRecipeNotes";
import DisplayTitle from "./DisplayRecipeComponents/DisplayTitle";
import ImageUploadModal from "./RecipeImageComponents/ImageUploadModal";
import CameraIcon from "./RecipeImageComponents/CameraIcon";
import { FontAwesome } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import RecipeShareLogo from "./RecipeShareLogo";
import CommitModal from "./EditRecipeComponents/Modal";

import { StackActions, NavigationActions } from "react-navigation";

import { fetchRecipes } from "../store/recipes/recipeActions";

function IndividualRecipe(props) {
    const dispatch = useDispatch();
    const [color, setColor] = useState({ active: "Ingredients" });
    const [userId, setUserId] = useState(null);
    const [commitModal, setCommitModal] = useState({
        save: false,
        cancel: false,
    });
    const [tempRecipe, setTempRecipe] = useState(null);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const recipe = useSelector(state => state.singleRecipe.recipe);
    const totalCookTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const isLoading = useSelector(state => state.singleRecipe.isLoading);
    const successAlert = useSelector(state => state.singleRecipe.successAlert);

    const editMode = useSelector(state => state.singleRecipe.editMode);
    const currentActive = useSelector(
        state => state.singleRecipe.currentActive,
    );

    //Anytime someone navigations to here - it has ID, we could just also pass another value
    const id = props.navigation.getParam("recipeID", "params not passed");
    const revisionId = props.navigation.getParam(
        "revisionID",
        "revisionId not passed",
    );

    const loadRecipe = async () => {
        try {
            if (!!Number(revisionId))
                dispatch(fetchVersionByRevisionId(id, revisionId));
            else dispatch(fetchRecipe(id));
        } catch (error) {
            throw new Error("This is an error");
        }
    };

    useEffect(() => {
        loadRecipe();
        fetchUserId();

        //below is a cleanup that resets the initState of singleRecipe to null values,
        //which is important for a smooth user experience
        return () => dispatch(resetRecipe());
    }, [id, revisionId]);

    useEffect(() => {
        const didBlurSubscription = props.navigation.addListener(
            "didBlur",
            () => {
                setColor({ active: "Ingredients" });
            },
        );
        return () => {
            didBlurSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (successAlert) {
            dispatch(resetAlerts());
            Alert.alert(
                "",
                "Recipe saved successfully!",
                [
                    {
                        text: "OK",
                    },
                ],
                { cancelable: false },
            );
        }
    });

    async function fetchUserId() {
        try {
            const fetchId = await AsyncStorage.getItem("userID");
            setUserId(Number(fetchId));
        } catch (err) {
            console.log(err);
        }
    }

    const tabsDisplay = cat => {
        const newActive = cat;
        setColor({ active: newActive });
        if (currentActive && currentActive.field === "title") {
            currentActive.close();
        }
        dispatch(resetCurrentActive());
    };

    const stopEditPress = () => {
        if (currentActive.type === "edit") {
            currentActive.close();
        }
        dispatch(fetchRecipes(""));
    };

    const startEditModeButton = () => {
        if (!recipe.owner.user_id || userId !== recipe.owner.user_id)
            return dispatch(stopEditMode());
        dispatch(startEditMode());
        setTempRecipe(recipe);
    };

    const saveButtonEditedRecipe = author_comment => {
        dispatch(submitEditedRecipe(author_comment));
        dispatch(stopEditMode());
        dispatch(resetCurrentActive());
        dispatch(fetchRecipes(""));
        setCommitModal({ save: false, cancel: false });
    };

    const hasRevisions = () =>
        // Double !! turn the value into a guaranteed boolean (true or false)
        // If any values are 'undefined' or 'NaN', this will ensure they are 'false'
        !!Number(revisionId) || !!Number(recipe.previous_versions_count);

    // const getVersionString = () =>
    //     recipe.revision_number
    //         ? `AUTHOR COMMENT ON VERSION ${recipe.revision_number}:`
    //         : "AUTHOR COMMENT ON CURRENT VERSION:";

    const cancelButtonEditedRecipe = () => {
        //TO DO - an alert or modal before dispatching stopEditMode
        Alert.alert(
            "Exit Edit Mode",
            "Are you sure you want to exit without saving your changes?",
            [
                {
                    text: "Cancel",

                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: () => {
                        dispatch(stopEditMode());
                        dispatch(resetCurrentActive());
                        dispatch(fetchRecipes(""));
                        dispatch(resetRecipe(tempRecipe));
                    },
                },
            ],
            { cancelable: false },
        );
    };

    const deleteRecipeHandler = () => {
        console.log("deleting", recipe);

        try {
            Alert.alert(
                "Are you sure you want to delete this recipe?",
                "This will delete all versions of this recipe.",
                [
                    {
                        text: "Cancel",

                        style: "cancel",
                    },
                    {
                        text: "OK",
                        onPress: () => {
                            dispatch(deleteRecipe(recipe.id));
                            dispatch(fetchRecipes(""));
                            props.navigation.navigate("Home");
                        },
                    },
                ],
                { cancelable: false },
            );
        } catch (error) {
            throw new Error("This is an error");
        }
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

    const editableRecipeDisplay = () => {
        return (
            (
                <CreateRecipeForm
                    navigation={props.navigation}
                    savedRecipe={tempRecipe}
                    cancelButtonEditedRecipe={cancelButtonEditedRecipe}
                    saveButtonEditedRecipe={saveButtonEditedRecipe}
                />
            ) || (
                <KeyboardAvoidingView behavior={"position"} style={{ flex: 1 }}>
                    <SafeAreaView>
                        <TouchableWithoutFeedback onPress={stopEditPress}>
                            <ScrollView>
                                <View style={styles.recipeContainer}>
                                    <CommitModal
                                        modal={modal}
                                        setModal={setModal}
                                        saveButtonEditedRecipe={
                                            saveButtonEditedRecipe
                                        }
                                    />
                                    <ImageUploadModal
                                        visible={imageModalVisible}
                                        setVisible={setImageModalVisible}
                                        scope="global"
                                    />
                                    <ImageBackground
                                        source={
                                            recipe.img
                                                ? { uri: recipe.img }
                                                : savedPlaceholder
                                        }
                                        style={styles.image}
                                    >
                                        <TouchableOpacity
                                            onPress={() => {
                                                setModal({
                                                    save: true,
                                                    cancel: false,
                                                });
                                            }}
                                            style={styles.editButton}
                                        >
                                            <FontAwesome
                                                name="check"
                                                size={20}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={cancelButtonEditedRecipe}
                                            style={styles.deleteButton}
                                        >
                                            <Octicons
                                                name="x"
                                                size={20}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                        <View style={styles.cameraIcon}>
                                            <CameraIcon
                                                setImageModalVisible={
                                                    setImageModalVisible
                                                }
                                            />
                                        </View>
                                    </ImageBackground>
                                    <View style={styles.titleWrapper}>
                                        <Title
                                            title={recipe.title}
                                            currentActive={currentActive}
                                        />
                                    </View>
                                    <View style={styles.innovatorTime}>
                                        <View style={styles.innovatorContainer}>
                                            <Image
                                                source={logo}
                                                style={styles.icon}
                                            />
                                            <Text>
                                                {recipe.owner.username &&
                                                recipe.owner.username.length >
                                                    maxUsername
                                                    ? `${recipe.owner.username.slice(
                                                          0,
                                                          maxUsername,
                                                      )}...`
                                                    : recipe.owner.username}
                                            </Text>
                                        </View>

                                        <View style={styles.timeContainer}>
                                            <Image
                                                source={clock}
                                                style={styles.icon}
                                            />
                                            <Text>{totalCookTime} minutes</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.tags}>Tags</Text>
                                    <View style={styles.tagBox}>
                                        {recipe.tags &&
                                            recipe.tags.map(cat => (
                                                <Text
                                                    key={cat.id}
                                                    style={
                                                        styles.individualTags
                                                    }
                                                >
                                                    {cat.name}
                                                </Text>
                                            ))}
                                    </View>
                                    <View style={styles.tabsContainer}>
                                        <Tab
                                            text="Ingredients"
                                            color={color}
                                            toggleTab={tabsDisplay}
                                        />
                                        <Tab
                                            text="Instructions"
                                            color={color}
                                            toggleTab={tabsDisplay}
                                        />
                                    </View>

                                    <View style={styles.recipeDetails}>
                                        {color.active === "Ingredients" && (
                                            <>
                                                {recipe.ingredients &&
                                                    recipe.ingredients.map(
                                                        (ing, i) => (
                                                            <IndividualRecipeIngredient
                                                                key={i}
                                                                index={i}
                                                                recipeIng={ing}
                                                                currentActive={
                                                                    currentActive
                                                                }
                                                            />
                                                        ),
                                                    )}

                                                <AddIngredient
                                                    currentActive={
                                                        currentActive
                                                    }
                                                />
                                            </>
                                        )}

                                        {color.active === "Instructions" && (
                                            <>
                                                {recipe.instructions &&
                                                    recipe.instructions.map(
                                                        (step, i) => (
                                                            <IndividualRecipeInstruction
                                                                key={
                                                                    step.step_number
                                                                }
                                                                index={i}
                                                                instruction={
                                                                    step
                                                                }
                                                                currentActive={
                                                                    currentActive
                                                                }
                                                            />
                                                        ),
                                                    )}

                                                <AddInstruction
                                                    instructionsLength={
                                                        recipe.instructions
                                                            .length
                                                    }
                                                    currentActive={
                                                        currentActive
                                                    }
                                                />
                                                <View
                                                    style={{
                                                        paddingRight: "80%",
                                                    }}
                                                >
                                                    {recipe.notes[0].id !==
                                                        null && (
                                                        <Text
                                                            style={styles.notes}
                                                        >
                                                            NOTES
                                                        </Text>
                                                    )}
                                                </View>
                                                {recipe.notes[0].id !== null &&
                                                    recipe.notes.map(
                                                        (note, i) => (
                                                            <IndividualRecipeNotes
                                                                key={i}
                                                                index={i}
                                                                note={note}
                                                                currentActive={
                                                                    currentActive
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                <AddNote
                                                    currentActive={
                                                        currentActive
                                                    }
                                                />
                                            </>
                                        )}
                                    </View>
                                </View>
                            </ScrollView>
                        </TouchableWithoutFeedback>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            )
        );
    };

    const nonEditableRecipeDisplay = () => {
        return (
            <SafeAreaView>
                <ScrollView>
                    <View style={styles.recipeContainer}>
                        <ImageBackground
                            source={
                                recipe.img
                                    ? { uri: recipe.img }
                                    : savedPlaceholder
                            }
                            style={styles.image}
                        >
                            {recipe.owner.user_id &&
                                userId === recipe.owner.user_id && (
                                    <TouchableOpacity
                                        onPress={startEditModeButton}
                                        style={styles.editButton}
                                    >
                                        <FontAwesome
                                            name="pencil-square-o"
                                            size={20}
                                            color="white"
                                        />
                                    </TouchableOpacity>
                                )}
                            {recipe.owner.user_id &&
                                userId === recipe.owner.user_id && (
                                    <TouchableOpacity
                                        onPress={deleteRecipeHandler}
                                        style={styles.deleteButton}
                                    >
                                        <FontAwesome
                                            name="trash-o"
                                            size={20}
                                            color="white"
                                        />
                                    </TouchableOpacity>
                                )}
                        </ImageBackground>
                        {/* <View style={styles.titleWrapper}> */}
                        <View style={styles.recipeContentContainer}>
                            <DisplayTitle title={recipe.title} />
                            {/* </View> */}
                            {/* tags(row)*/}
                            {/* previous versions(under edit button, flex-end) */}
                            <View>
                                <Text style={styles.authorName}>
                                    {recipe.owner.username &&
                                    recipe.owner.username.length > maxUsername
                                        ? `By ${recipe.owner.username.slice(
                                              0,
                                              maxUsername,
                                          )}...`
                                        : `By ${recipe.owner.username}`}
                                </Text>
                                <View style={styles.underTitleRow}>
                                    <View style={styles.tagRow}>
                                        {recipe.tags &&
                                            recipe.tags.map((tag, index) => (
                                                <Text
                                                    key={tag.id}
                                                    style={
                                                        styles.individualTags
                                                    }
                                                >
                                                    {tag.name}
                                                    {index <
                                                        recipe.tags.length -
                                                            1 && (
                                                        <Text
                                                            style={
                                                                styles.blackText
                                                            }
                                                        >
                                                            ,{" "}
                                                        </Text>
                                                    )}
                                                </Text>
                                            ))}
                                    </View>
                                    <View style={styles.timeContainer}>
                                        <Image
                                            source={clock}
                                            style={styles.icon}
                                        />
                                        <Text style={styles.cookTimeText}>
                                            {totalCookTime} minutes
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.versionHistoryContainer}>
                                    {hasRevisions() && (
                                        <TouchableOpacity
                                            onPress={() =>
                                                props.navigation.navigate(
                                                    "VersionHistoryList",
                                                    { parentId: id },
                                                )
                                            }
                                        >
                                            <Text style={styles.versions}>
                                                Previous Versions
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <View style={styles.tabsContainer}>
                                <Tab
                                    text="Ingredients"
                                    color={color}
                                    toggleTab={tabsDisplay}
                                />
                                <Tab
                                    text="Instructions"
                                    color={color}
                                    toggleTab={tabsDisplay}
                                />
                            </View>

                            <View style={styles.recipeDetails}>
                                {color.active === "Ingredients" && (
                                    <>
                                        {recipe.ingredients &&
                                            recipe.ingredients.map((ing, i) => (
                                                <DisplayRecipeIngredient
                                                    key={i}
                                                    ingredient={ing}
                                                />
                                            ))}
                                    </>
                                )}
                                {color.active === "Instructions" && (
                                    <>
                                        {recipe.instructions &&
                                            recipe.instructions.map(
                                                (step, i) => (
                                                    <DisplayRecipeInstruction
                                                        key={step.step_number}
                                                        instruction={step}
                                                    />
                                                ),
                                            )}

                                        {recipe.notes[0].id !== null && (
                                            <Text style={styles.notes}>
                                                Notes
                                            </Text>
                                        )}
                                        {recipe.notes[0].id !== null && (
                                            <View style={styles.redBorder} />
                                        )}
                                        {recipe.notes[0].id !== null &&
                                            recipe.notes.map((note, i) => (
                                                <DisplayRecipeNotes
                                                    key={i}
                                                    notes={note}
                                                    index={i}
                                                />
                                            ))}
                                    </>
                                )}
                            </View>
                            {/* <View style={{ marginLeft: 10 }}>
                                <Text style={{ fontWeight: "bold" }}>
                                    {getVersionString()}
                                </Text>
                                <Text>{recipe.author_comment}</Text>
                            </View> */}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    };

    return editMode ? editableRecipeDisplay() : nonEditableRecipeDisplay();
}

IndividualRecipe.navigationOptions = {
    headerTitle: <RecipeShareLogo />,
    headerStyle: {
        backgroundColor: theme.NAV_BAR_BACKGROUND_COLOR,
    },
};

export default IndividualRecipe;
