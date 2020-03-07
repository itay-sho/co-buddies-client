import React from 'react';

import './PageFooter.scss';

const PageFooter = () => {
    const github_link = "https://github.com";
    const author_link = "mailto:itai.sho@gmail.com?subject=האתר co-buddies שלך";
    return (
        <div className="PageFooter fixed-bottom">
            <div className="navbar">
                <div className="float-left">
                    Developed & designed by <a href={author_link}>Itay Shoshani</a>
                </div>
                <div className="float-right">
                    <a href={github_link}>Contribute</a> to this project
                </div>
            </div>
        </div>
    );
};

export default PageFooter;
