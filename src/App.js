import React, { useState, useEffect } from "react";
import {
  HashRouter,
  Switch,
  Route
} from "react-router-dom";
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';  

import Amplify, { DataStore, syncExpression, Predicates, SortDirection,  Storage, Auth } from 'aws-amplify';
import { Post, PostStatus } from "./models";
import { css } from '@emotion/css';
import SinglePost from "./SinglePost";
import Posts from './Posts';
import Header from './Header';
import CreatePost from './CreatePost';
import Button from './Button';

DataStore.configure({
  syncExpressions: [
    syncExpression(Post, () => {
      return post => post.status('eq', PostStatus.ACTIVE)
    })
  ]
});

function Router() {
  /* create a couple of pieces of initial state */
  const [showOverlay, updateOverlayVisibility] = useState(false);
  const [posts, updatePosts] = useState([]);
  const [myPosts, updateMyPosts] = useState([]);

  /* fetch posts when component loads */
  useEffect(() => {
      fetchPosts();
      const subscription = DataStore.observe(Post).subscribe(msg => {
        console.log(msg.model, msg.opType, msg.element);
        fetchPosts();
      });
      return () => subscription.unsubscribe();
  }, []);
  async function fetchPosts() {
    
    /* check if user is logged in */
    let user = await Auth.currentAuthenticatedUser();
    Amplify.configure({
      aws_appsync_authenticationType: user != null ? 'AMAZON_COGNITO_USER_POOLS' : 'API_KEY',
    });
    
    /* query the API, ask for 100 items */
    let postData = await DataStore.query(Post);
    console.log('POST DATA FROM LOCAL: ');
    console.log(postData);
    let postsArray = postData;
    /* map over the image keys in the posts array, get signed image URLs for each image */
    postsArray = await Promise.all(postsArray.map(async post => {
      let copyPost = {...post};
      if(copyPost.image != null) {
        const imageKey = await Storage.get(copyPost.image);
        copyPost.image = imageKey;
      }
      return copyPost;
    }));
    /* update the posts array in the local state */
    setPostState(postsArray);
  }
  async function setPostState(postsArray) {
    const user = await Auth.currentAuthenticatedUser();
    const myPostData = postsArray.filter(p => p.owner === user.username);
    updateMyPosts(myPostData);
    updatePosts(postsArray);
  }
  return (
    <>
      <HashRouter>
          <div className={contentStyle}>
            <Header />
            <hr className={dividerStyle} />
            <Button title="New Post" onClick={() => updateOverlayVisibility(true)} />
            <hr className={dividerStyle} />
            <Switch>
              <Route exact path="/" >
                <Posts posts={posts} />
              </Route>
              <Route path="/post/\:id" >
               <SinglePost/>
              </Route>
              <Route exact path="/myposts" >
                <Posts posts={myPosts} />
              </Route>
            </Switch>
          </div>
        </HashRouter>
        { showOverlay && (
          <CreatePost
            updateOverlayVisibility={updateOverlayVisibility}
            updatePosts={setPostState}
            posts={posts}
          />
        )}
    </>
  );
}

const dividerStyle = css`
  margin-top: 15px;
`

const contentStyle = css`
  min-height: calc(100vh - 45px);
  padding: 0px 40px;
  width: 80vw;
  max-width: 690px;
  margin\:auto;
  font-family:'Amazon Ember', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  background: #fff;
`

export default withAuthenticator(Router);

