import React, {useState} from 'react';

const ResizableTextarea = (props) => {
    const enterAction = props.enterAction;
    const [textareaState, setTextAreaState] = useState({
        rows: props.rows,
        minRows: props.minRows,
        maxRows: props.maxRows,
    });
    const [style, setStyle] = useState({resize: "none", width: "100%", lineHeight: '24px', direction: "rtl"});

    const get_direction = (textarea) => {
        if (textarea.value[0] != null && textarea.value[0].search(/[\u0590-\u05FF]/) < 0) {
            return "ltr";
        }
        return "rtl";
    };

    const onEnterPress = (e) => {
        if(e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            enterAction();
        }
    };

    const handleChange = (event) => {
        const textareaLineHeight = 24;
        const { minRows, maxRows } = textareaState;

        const previousRows = event.target.rows;
        event.target.rows = minRows; // reset number of rows in textarea

        // subtracting vertical padding
        const currentRows = ~~((event.target.scrollHeight - 20) / textareaLineHeight);

        if (currentRows === previousRows) {
            event.target.rows = currentRows;
        }

        if (currentRows >= maxRows) {
            event.target.rows = maxRows;
            event.target.scrollTop = event.target.scrollHeight;
        }

        // Updating states
        setStyle({
            ...style,
            direction: get_direction(event.target)
        });

        setTextAreaState({
            ...textareaState,
            rows: currentRows < maxRows ? currentRows : maxRows,
        });
    };

    return (
        <textarea
            rows={textareaState.rows}
            placeholder='הקלד\י הודעה'
            className='ResizeableTextarea'
            onKeyDown={onEnterPress}
            onChange={handleChange}
            style={style}
        />
    );
};

export default ResizableTextarea;