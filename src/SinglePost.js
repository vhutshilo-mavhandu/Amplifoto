import React, { useState, useEffect } from 'react'
import { css } from '@emotion/css';
import { useParams } from 'react-router-dom';
import { API, Storage } from 'aws-amplify';
import { getPost } from './graphql/queries';

export default function SinglePost() {
  const [loading, updateLoading] = useState(true);
  const [post, updatePost] = useState(null);
  const { id } = useParams()
  useEffect(() => {
    fetchPost()
  }, [])
  async function fetchPost() {
    try {
      const postData = await API.graphql({
        query: getPost, variables: { id }
      });
      const currentPost = postData.data.getPost
      const image = await Storage.get(currentPost.image);

      currentPost.image = image;
      updatePost(currentPost);
      updateLoading(false);
    } catch (err) {
      console.log('error: ', err)
    }
  }
  if (loading) return <h3>Loading...</h3>
  console.log('post: ', post)
  return (
    <div className={postContainer}>
      <div className={ownerContainer}>
        <div className={avatarPlaceholder}>
          <img src={post.image}/>
        </div> 
        <h2>{post.owner}</h2>
        <h4>{post.location}</h4>
      </div>
      <h2>Hello world is this world!!!!</h2>
        <h3 className={postTitleStyle}>{post.name}</h3>
        <p>{post.description}</p>
        <img alt="post" src={post.image} className={imageStyle} />
    </div>
  )
}

const titleStyle = css`
  margin-bottom: 7px;
`

const locationStyle = css`
  color: #0070f3;
  margin: 0;
`

const imageStyle = css`
  max-width: 200px;
  @media (max-width: 200px) {
    width: 90;
  }
`

const ownerContainer = css`
  border-bottom: 1px solid #dedede;
  h2 { 
    display: inline-block;
    margin-left: 20px;
    color: #152939;
  }
  h4 {
    font-style: italic;
    margin-top: 0px;
  }
`

const avatarPlaceholder = css`
  width: 20px;
  height: 30px;
  padding-top: 10px;
  display: inline-block;
  img {
    margin-top: 5px;
    width: 100%;
    border: 1px solid #dedede;
    border-radius: 20px;
  }
`
const postTitleStyle = css`
  margin: 15px 0px;
  color: #152939;
`

const postContainer = css`
  margin-top: 20px;
  border-radius: 4px;
  padding: 1px 20px 20px 20px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  \:hover {
    border-color: #0070f3;
  }
`
