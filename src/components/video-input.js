import React from 'react';

export const VideoInput = (props)=>{
    const inputRef = React.useRef(undefined)
    const [urlCheck,setUrlCheck] = React.useState(false)
    //const [value,setValue] = React.useState("https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4")
    const [value,setValue] = React.useState("../../data/truck_berth.mp4")
    const { updateState } = props;

    const onClick = ()=>{
        const videoUrl = inputRef.current.value
        const result = true ///^https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+/.test(videoUrl)
        setUrlCheck(result)
        if(result){
            updateState({ videoUrl });
        }
    };

    const onChange = (e)=>{
        const checkStr = e.target.value
        const result = true ///^https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+/.test(checkStr)
        setUrlCheck(result)
        setValue(checkStr)
    };

    return (
        <ol className="video_input">
            <li className="flex_row">
                <input type="url" ref={inputRef} style={{'width':'100%'}}
                onChange={onChange} value={value}/>
            </li>
            <li className="flex_row">
                <button onClick={onClick} style={{'width':'100%'}}
                    className="harmovis_button">{urlCheck?'Set URL':'Please enter URL'}</button>
            </li>
        </ol>
    );
}
