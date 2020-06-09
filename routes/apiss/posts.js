const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')
const Post = require('../../models/Post')
const validatePostInput = require('../../validators/post')


///testing the post route

router.get('/test', (req, res) => {
  res.json({
    msg: 'Post Works'
  })
})
//add post
//

router.post('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const {
    errors,
    isValid
  } = validatePostInput(req.body)
  if (!isValid) {
    return res.status(400).json(errors)
  }
  const newPost = new Post({

    user: req.user.id,
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.name
  })
  newPost.save().then(post => res.json(post))
})
//get post
//public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)

    .then(posts => res.json(posts))
    .catch(err => res.staus(404).json({ msg: 'no posts found' }))

})
//get post
//public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(post => res.json(post))
    .catch(err => res.staus(404).json({ msg: 'no post found' }))

})
//delete post
//private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ notauthorized: 'user not authorized' })
          }
          post.remove().then(() => res.json({ success: true }))
        })
        .catch(err => res.status(404)).json({ postnotfound: 'post not found' })
    })
})
// post likes/:postid
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ alreadyliked: 'user already liked this post' })
          }
          //add user id to likes
          post.likes.unshift({ user: req.user.id })
          post.save().then(post => res.json(post))

        })
        .catch(err => res.status(404)).json({ postnotfound: 'post not found' })
    })
})
//post unlike by id
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ notliked: 'user have not liked this post' })
          }
          // remove by index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id)
          post.likes.splice(removeIndex, 1);
          post.save().then(post => res.json(post))


        })
        .catch(err => res.status(404)).json({ postnotfound: 'post not found' })
    })
})
//add comment
//post privvate
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body)
  if (!isValid) {
    return res.status(400).json(errors)
  }
  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id

      }
      post.comments.unshift(newComment)
      post.save().then(post => res.json(post))
    })
    .catch(err => res.status(404).json({ postnotfound: 'post not found' }))
})
//delete comment
//private 

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

  Post.findById(req.params.id)
    .then(post => {
      ///check comment exists
      if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({ commentnotexists: 'comment doesnt exists' })
      }
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id)
      post.comments.splice(removeIndex, 1);
      post.save().then(post => res.json(post))


    })
    .catch(err => res.status(404).json({ postnotfound: 'post not found' }))
})
module.exports = router