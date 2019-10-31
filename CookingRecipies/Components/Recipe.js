import React from 'react';
import styles from '../styles/recipe-styles';
import styled from 'styled-components/native';  //deprecated way , but required to test styled components using jest. 
import {View,Text,ScrollView, Image} from 'react-native';
// import styled from 'styled-components';
import clearHeart from '../assets/clear-heart.png';
import solidHeart from '../assets/solid-heart.png';

const Recipe = (props) => {

    const {recipe, height} = props;
    // console.log('props in recipe', props);
    let [like, setLike] = React.useState(false);
    // let [likeCount, setLikeCount] = React.useState(props.recipe.likes)  //get likes from recipe handed down via props from the database.
    const RecipeCard = styled.View`
    flex: 1;
    marginLeft : 10;
    marginRight : 10;
    justifyContent: flex-start;
    minWidth: 150;
    marginBottom: 10;
    `;

    const UserCard = styled.View`
      flexDirection : row;
      justifyContent : flex-start;
    `;

    const Like = styled.View`
        flexDirection: row;
        position: absolute;
        left : 10;
        top: 5;
        zIndex : 1;
    `;

    // const RecipeImage = styled.View`
    //     marginRight: 30;
    //     paddingRight: 10;
    // `;

    const likeIt = () => {
        console.log('like pressed');
        setLike(!like);
    }

    return (
        <>
            {/* <View style={{flex: 1, minWidth: 160, alignItems: 'center'}}> */}
            <RecipeCard>
                <Like onStartShouldSetResponder={likeIt}>
                    <Image source={like ? solidHeart : clearHeart } style={{width: 20, height: 20}}/>
                    <Text style={{color : 'white', fontWeight: 'bold'}}> 3k</Text>
                </Like>
               
                <Image 
                    source={{uri : 'https://fakeimg.pl/250x100/?text=recipe'}}
                    style={{width: 190, height: height, borderRadius: 20, paddingRight: 20 }}
                    resieMode="contain"
                />
                
                <Text style={styles.text}>Sample Recipe</Text>
                <UserCard>
                    <Image source={{uri : "https://fakeimg.pl/50x50/?text=user"}}
                        style={{width: 50, height: 50 }}/>
                    <View style={styles.usercardTxt}>
                        <Text style={styles.username}>Username</Text>
                        <Text style={styles.username}></Text>
                        <Text style={styles.prep}>Min: Prep Time</Text>
                    </View>
                </UserCard>
            </RecipeCard>
        </>
    )
}

export default Recipe;