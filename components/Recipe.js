import React, { useState, useEffect } from "react";
import styles from "../styles/recipe-styles";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    AsyncStorage,
} from "react-native";
import { withNavigation } from "react-navigation";
import LikeModal from "./LikekModal";
import UnlikeModal from "./UnlikeModal";
import Like from "./StyledComponents/Like";
import Fork from "./StyledComponents/Fork";
import UserPrepTime from "./StyledComponents/UserPrepTime";
import RecipeContainer from "./StyledComponents/RecipeContainer";
import clearHeart from "../assets/orangeBorder.png";
import solidHeart from "../assets/orangeFill.png";
import axiosWithAuth from "../utils/axiosWithAuth";
import placeholder from "../assets/recipe-image-placeholder.png";
import forkLogo from "../assets/background.png";

const Recipe = props => {
    const { navigation, recipe } = props;
    let [like, setLike] = useState(recipe.likedByUser);
    let [likeCount, setLikeCount] = useState(recipe.total_saves);
    let [userToken, setUserToken] = useState(null);
    let [addModal, setAddModal] = useState(false);
    const [removeModal, setRemoveModal] = useState(false);
    const [categories, setCategories] = useState([]);

    const getToken = async () => {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
            setUserToken(token); //the token is used to determine if the <Like> component should be rendered or not
        }

        return token;
    };

    const getRecipe = async () => {
        try {
            const res = await axiosWithAuth.get(`recipes/${recipe.id}`);
            let { categories } = res.data;
            categories = categories.filter(
                cat =>
                    cat === "Breakfast" ||
                    cat === "Brunch" ||
                    cat === "Lunch" ||
                    cat === "Dinner" ||
                    cat === "Dessert" ||
                    cat === "Snack",
            );
            setCategories(categories);
        } catch (err) {
            console.log("error in getting recipe by id", recipe.id);
        }
    };

    useEffect(() => {
        getRecipe();
        getToken();
    }, [like, likeCount]);

    // TODO: Make this an action
    const likeIt = async () => {
        let liked = !like; //like is the state variable. it gets set after execution of the function likeIt() declared a temp liked variable to execute the logic of this function.

        if (liked) {
            axiosWithAuth()
                .post(`cookbook/${recipe.id}`, {})
                .then(res => {
                    setLikeCount(res.data.total_saves);
                    setLike(liked);
                    setAddModal(!addModal);
                })
                .catch(err => console.log("error in posting like", err));
        } else {
            axiosWithAuth()
                .delete(`cookbook/${recipe.id}`)
                .then(res => {
                    if (!res.data.total_saves) {
                        setLikeCount(0);
                    } else {
                        setLikeCount(res.data.total_saves);
                    }

                    setLike(liked);

                    const route = navigation.state.routeName;

                    if (route === "Home") {
                        return;
                    }
                    setRemoveModal(!removeModal);
                })
                .catch(err => console.log("err in deleting like", err));
        }
    };

    return (
        <RecipeContainer>
            <LikeModal
                categories={categories}
                text="Recipe added to: "
                modal={addModal}
                setModal={setAddModal}
                route={navigation.state.routeName}
            />

            <UnlikeModal
                categories={categories}
                text="Recipe removed from: "
                modal={removeModal}
                setModal={setRemoveModal}
                route={navigation.state.routeName}
                navigate={navigation.pop}
            />

            <View
                style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    zIndex: 1,
                    marginRight: 10,
                }}
            >
                {userToken && (
                    <>
                        <Like
                            onPress={likeIt}
                            onStartShouldSetResponder={likeIt}
                        >
                            <Image
                                source={like ? solidHeart : clearHeart}
                                style={{ width: 30, height: 30 }}
                            />
                            <Text
                                style={{ color: "white", fontWeight: "bold" }}
                            >
                                {String(likeCount)}
                            </Text>
                        </Like>
                        {/* TODO: 
                            If the backend can send recipes with a forkCount, 
                            we can use this section of code.
                            If not, we can just delete it.

                        {forkCount >= 1 && (
                            <Fork>
                                <Image
                                    source={forkLogo}
                                    style={{ width: 30, height: 30 }}
                                />
                                <Text
                                    style={{
                                        color: "black",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {String(forkCount)}
                                </Text>
                            </Fork>
                        )} */}
                    </>
                )}
            </View>

            <TouchableOpacity
                onPress={() =>
                    navigation.navigate("IndividualR", {
                        recipeID: recipe.id,
                    })
                }
            >
                <Image
                    source={recipe.img ? { uri: recipe.img } : placeholder}
                    style={{ width: "100%", height: 200 }}
                />

                <Text style={styles.text}>{recipe.title}</Text>

                <UserPrepTime>
                    <Text style={styles.username}>
                        {recipe.username || recipe.author}
                    </Text>
                    <Text style={styles.prep}>{recipe.minutes} min.</Text>
                </UserPrepTime>
            </TouchableOpacity>
        </RecipeContainer>
    );
};

export default withNavigation(Recipe);