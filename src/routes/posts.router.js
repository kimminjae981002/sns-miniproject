const express = require("express");
const router = express.Router();
const { checkAuthenticated, checkPostOwnership } = require("../middlewares/auth");
const Post = require('../models/posts.model')
const multer = require('multer')
const path = require('path')
const Comment = require('../models/comments.model')

const storageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, '../public/assets/images'))
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname)
  }
})

const upload = multer({ storage: storageEngine }).single('image')

// auth 미들웨어를 실행하고, upload 미들웨어를 실행한다.
router.post('/', checkAuthenticated, upload, (req, res) => {
  let name = req.body.name;
  let description = req.body.description;
  let image = req.file ? req.file.filename : "";
  Post.create({
    name,
    image,
    description,
    author: {
      id: req.user._id,
      username: req.user.username
    }
  }).then(result => {
    req.flash('success', '포스트 생성 성공') // 포스트가 생성 되면 req.flash에 전달 해준다.
    res.redirect('back')
  }).catch(err => {
    if (err) {
      req.flash('error', '포스트 생성 실패')
      res.redirect('back')
    }
  })
})

// Post DB에 있는 모든 것들을 찾고 comments 전체 모델에 있는 데이터도 보여주고 실행해라
// posts에는 posts 데이터를 가져오고 currentUser에는 현재 로그인 된 유저를 넣어준다.
// ejs에서 사용가능하다.
router.get("/", checkAuthenticated, (req, res) => {
  Post.find().populate('comments').sort({ createdAt: -1 }).exec() // createdAt을 하면 최신이 위로 나온다.
    .then(posts => {
      res.render("posts/index", {
        posts: posts,
      })
    }).catch(err => {
    console.log(err)
  })

});

// 포스트 수정 버튼 클릭 시 render
router.get('/:id/edit', checkPostOwnership, async (req, res) => {
  // const post = Post.findById(req.params.id)
  res.render('posts/edit',{post: req.post})
})

// 포스트 수정 시 수정해주기
router.put('/:id', checkPostOwnership, (req, res) => {
  Post.findByIdAndUpdate(req.params.id, req.body)
    .then((result) => {
      if (result) {
        req.flash('success', '포스트 수정에 성공했습니다.')
        res.redirect('/posts')
      }
    }).catch((error) => {
      if (error) {
        req.flash('error', '포스트 수정에 실패했습니다.')
        res.redirect('/posts')
    }
  })
})

// 포스트 삭제
router.delete('/:id', checkPostOwnership,async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    req.flash('error','포스트 삭제에 실패했습니다.')
  }

  req.flash('success', '포스트 삭제에 성공했습니다.')
  res.redirect('/posts')
})

module.exports = router;
