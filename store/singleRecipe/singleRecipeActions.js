import axiosWithAuth from "../../utils/axiosWithAuth";

export const STOP_EDIT = "STOP_EDIT";
export const START_UPDATE_RECIPE = "START_UPDATE_RECIPE";
export const UPDATE_RECIPE_SUCCESS = "UPDATE_RECIPE_SUCCESS";
export const UPDATE_RECIPE_FAILURE = "UPDATE_RECIPE_FAILURE";

let calling = false;
export const stopEdit = () => async (dispatch, getState) => {
    dispatch({ type: STOP_EDIT }); // Stop editing our recipe

    // We call this stopEdit() function a few times in our components to make sure we stop editing.
    // The "calling" variable makes sure that, if we're allready in this axios call, we won't
    // call the database multiple times until we're done with our current call '' '
    if (calling) return;
    calling = true;
    dispatch({ type: START_UPDATE_RECIPE });

    const { recipe } = getState().singleRecipe; // grabbing the store from redux
    try {
        const axiosCustom = await axiosWithAuth();
        const res = await axiosCustom.put(`recipes`, recipe);

        dispatch({ type: UPDATE_RECIPE_SUCCESS, payload: res.data });
    } catch (err) {
        const data = err.response.data;
        // If we fail to update a recipe, there are many reasons why.
        // One of the reasons could be that we're trying to update a recipe that isn't our own. (401, 403)
        // If that's the case, the server returns a currentRecipe property so we can restore any
        //      edited values back to their original.
        // If we have a property called currentRecipe, we will use that to reset our store '' '
        if (data.currentRecipe) {
            dispatch({
                type: UPDATE_RECIPE_FAILURE,
                payload: err,
                recipe: data.currentRecipe,
            });
        }
        dispatch({ type: UPDATE_RECIPE_FAILURE, payload: err });
    } finally {
        calling = false;
    }
};

export const START_EDIT = "START_EDIT";
export const startEdit = () => ({ type: START_EDIT });

export const START_FETCH_RECIPE = "START_FETCH_RECIPE";
export const FETCH_RECIPE_SUCCESS = "FETCH_RECIPE_SUCCESS";
export const FETCH_RECIPE_FAILURE = "FETCH_RECIPE_FAILURE";

export const fetchRecipe = id => async dispatch => {
    dispatch({ type: START_FETCH_RECIPE });

    try {
        const axiosCustom = await axiosWithAuth();
        const res = await axiosCustom.get(`recipes/${id}`);

        dispatch({ type: FETCH_RECIPE_SUCCESS, payload: res.data });
    } catch (err) {
        dispatch({ type: FETCH_RECIPE_FAILURE, payload: err });
    }
};

export const START_SAVE_NEW_RECIPE = "START_SAVE_NEW_RECIPE";
export const SAVE_NEW_RECIPE_SUCCESS = "SAVE_NEW_RECIPE_SUCCESS";
export const SAVE_NEW_RECIPE_FAILURE = "SAVE_NEW_RECIPE_FAILURE";

export const saveNewRecipe = recipeInfo => async dispatch => {
    dispatch({ type: START_SAVE_NEW_RECIPE });

    try {
        const axiosCustom = await axiosWithAuth();
        const res = await axiosCustom.post("recipes/");

        dispatch({ type: SAVE_NEW_RECIPE_SUCCESS });
    } catch (err) {
        dispatch({ type: SAVE_NEW_RECIPE_FAILURE, payload: err });
    }
};

export const RESET_RECIPE = "RESET_RECIPE";
export const resetRecipe = () => {
    return {
        type: RESET_RECIPE,
    };
};


// When editing our individual recipe, if we ever stop editing 
// - The title
// - An ingredient
// - An instruction
// We want to make sure that we call our stopEdit() function in order to:
// 1. return the STOP_EDIT action
// 2. Call the database to update whatever edit we just made
// Whenever we have "dispatch(stopEdit())",
//     that's when we stop editing the recipe and call the database '' '
export const EDIT_TITLE = "EDIT_TITLE";
export const editTitle = value => dispatch => {
    if (value.charCodeAt(value.length - 1) === 10) dispatch(stopEdit());
    else {
        dispatch({
            type: EDIT_TITLE,
            payload: value,
        });
    }
};

export const EDIT_INGRED = "EDIT_INGRED";
export const editIngred = (index, value) => dispatch => {
    console.log(value);
    if (value.name.charCodeAt(value.length - 1) === 10) dispatch(stopEdit());
    else {
        dispatch({
            type: EDIT_INGRED,
            payload: value,
            index: index,
        });
    }
};

export const EDIT_INSTRUCT = "EDIT_INSTRUCT";
export const editInstruct = (index, value) => dispatch => {
    if (value.body.charCodeAt(value.body.length - 1) === 10)
        dispatch(stopEdit());
    else {
        dispatch({
            type: EDIT_INSTRUCT,
            payload: value,
            index: index,
        });
    }
};


export const EDIT_NOTES = "EDIT_NOTES"
export const editNotes = (notes) => dispatch => {
    if (notes.charCodeAt(notes.length - 1) === 10) dispatch(stopEdit())
    else {
        dispatch({
            type: EDIT_NOTES,
            notes: notes
    
        })
    }
}