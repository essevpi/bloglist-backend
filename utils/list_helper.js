const totalLikes = (blogs) => {
    const reducer = (likes, blog) => {
        return likes + blog.likes;
    };
    return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
    return blogs.length === 0
        ? null
        : blogs.reduce((mostLiked, currentBlog) =>
            (mostLiked.likes > currentBlog.likes)
                ? mostLiked
                : currentBlog
        );
};

const mostBlogs = (blogs) => {
    if(blogs.length === 0){
        return null;
    }

    const authors = blogs.reduce((acc, item) => {
        acc[item.author] = (acc[item.author] || 0) + 1;
        return acc;
    }, {});

    const filteredAuthor = Object.entries(authors)
        .reduce((acc, curr) => curr[1] > acc[1] ? curr : acc);

    return { 'author': filteredAuthor[0], 'blogs': filteredAuthor[1] };
};

const mostLikes = (blogs) =>  {
    if(blogs.length === 0){
        return null;
    }

    const authors = blogs.reduce((acc, item) => {
        acc[item.author] = (acc[item.author] || 0) + item.likes;
        return acc;
    }, {});

    const filteredAuthor = Object.entries(authors).
        reduce((acc, curr) => curr[1] > acc[1] ? curr : acc);

    return { 'author': filteredAuthor[0], 'likes': filteredAuthor[1] };
};

module.exports = {
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
};