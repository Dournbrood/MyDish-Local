import React, { useEffect } from "react";
import { FlatList, Text, View, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
    fetchVersionByRevisionId,
    fetchRecipe,
} from "../store/singleRecipe/singleRecipeActions";
import { fetchAllVersionHistory } from "../store/version-control/versionControlActions";
import styles from "../styles/versionHistoryListStyles";

const VersionHistoryList = props => {
    const versionList = useSelector(state => state.versionsList.versionsList);
    const dispatch = useDispatch();

    const id = props.id;

    async function fetchAllVersions(id) {
        await dispatch(fetchAllVersionHistory(id));
    }

    useEffect(() => {
        fetchAllVersions(id);
    }, [id]);

    return (
        <View>
            <FlatList
                data={versionList}
                keyExtractor={item => item.revision_number.toString()}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                item.id
                                    ? dispatch(
                                          fetchVersionByRevisionId(
                                              item.changes.id,
                                              item.id,
                                          ),
                                      )
                                    : dispatch(fetchRecipe(item.changes.id));

                                props.setVersionListVisible(false);
                            }}
                        >
                            <View style={styles.versionView}>
                                <Text style={styles.label}>
                                    {item.revision_number > 1
                                        ? `Version ${item.revision_number}`
                                        : `Original`}
                                </Text>
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={styles.commentLabel}>
                                        Author Comment:{" "}
                                    </Text>
                                    <Text style={{ width: "65%" }}>
                                        {item.changes.author_comment}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

VersionHistoryList.navigationOptions = {
    headerTitle: "Version History",
};

export default VersionHistoryList;
