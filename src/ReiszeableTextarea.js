import React, {useState} from 'react';

const ResizableTextarea = React.forwardRef((props, ref) => {
    const enterAction = props.enterAction;
    const disabled = props.disabled;

    const [textareaState, setTextAreaState] = useState({
        rows: props.rows,
        minRows: props.minRows,
        maxRows: props.maxRows,
        value: ''
    });
    const [style, setStyle] = useState({resize: "none", width: "100%", lineHeight: '24px', direction: "rtl"});
    ref.current = [textareaState, setTextAreaState];

    const get_direction = (textarea) => {
        if (textarea.value[0] != null && textarea.value[0].search(/[\u0590-\u05FF]/) < 0) {
            return "ltr";
        }
        return "rtl";
    };

    const onKeyPress = (e) => {
        if(e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            const value = e.target.value;
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
            value: event.target.value
        });
    };

    return (
        <textarea
            disabled={disabled}
            maxLength="500"
            rows={textareaState.rows}
            placeholder='הקלד\י הודעה'
            className='ResizeableTextarea'
            onKeyDown={onKeyPress}
            onChange={handleChange}
            style={style}
            value={textareaState.value}
        />
    );
});

export default ResizableTextarea;