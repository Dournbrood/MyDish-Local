import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";

import { authReducer as auth } from "./auth/authReducer";
import { recipeReducer as allRecipes } from "./recipes/recipeReducer";
import { cookbookReducer as cookbook } from "./cookbook/cookbookReducer";
import { singleRecipeReducer as singleRecipe } from "./singleRecipe/singleRecipeReducer";
import { versionControlRecucer as versionsList } from "./version-control/versionControlReducer";
import { navigationReducer as navigation } from "./navigation/navigationReducer";

const rootReducer = combineReducers({
    auth,
    allRecipes,
    cookbook,
    singleRecipe,
    versionsList,
    navigation,
});

export const store = createStore(rootReducer, applyMiddleware(thunk));
