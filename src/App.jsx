import {  useLayoutEffect, useMemo } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Modal from "./components/modal.jsx";
import useLocalStorageListener from "./components/useLocalStorage.js";
import MobileController from "./components/mobileTiltController.jsx";
import useScreenOrientation from "./components/onScreenChange.jsx";
  let css_col = " w-3 h-3 bg-gray-600 border-2 border-gray-600 transition transition-all duration-[50] ease-in-out";

export default function App() {
  
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Table />
    </div>
  );
}

// DROP FOOD; in blocks where no snake; i.e. it's not green

// EAT IN RESPONSE TO FOOD: Collision detection;
// ADD DIFFICULTY: SPEED;
// ADD MOBILE SUPPORT
const default_state = {length: 1, is_paused: false, has_started: false, food: {x:0, y:0}, bonus_food:  {x:0, y:0, active:false}, direction: "r", pending_direction:"r", speed: 80, snake: [], grid: []}

function Table() {
  const [ended, set_ended] = useState(false)
  const [isPaused, setPaused] = useLocalStorageListener("pause", true);
  
  const state = useRef(default_state);
  const [speed, setSpeed] = useState(80);
  const size =  useRef(40);
  const head = useRef({x: 0, y: 0});
  const setHead = (val) => head.current = val;
  
  // DEFINE

  let array = useMemo(() =>  Array(size.current).fill(undefined))
  let rows = [];
  let columns = [...array];
  //UI variables
  let css_row = "min-w-3 min-h-3 w-3 h-3";
  //let css_col = " w-3 h-3 bg-pink-500  border border-black";
  let css_active = " !bg-green-500";
  // Mappers
  const grid_ref = useRef([...array]);
  // Game variables;
 

  function eat () {
    // increase length; add to queue
    state.current.length += 1;
    state.current.snake.push({...head.current});
  }
  function feed () {
    // drop food in random unoccupied block
    let grid =  state.current.grid.flat().filter( b => !b.occupied);
    let rand_index = Math.floor( Math.random() * grid.length);
    let food_block = grid[rand_index];
    if (food_block) {
      state.current.food.x = food_block.x;
      state.current.food.y = food_block.y;
      state.current.grid[food_block.y][food_block.x].has_food = true;
      let block = grid_ref?.current[food_block.y][food_block.x];
      if (block?.className)  block.className +=(" !bg-yellow-500");
    }
  } 
  function faster () {
    if (state.current.speed >= 20)  state.current.speed -=  1;
  } 
  function handler_blockRef(ref, ri, ci) {
      if (grid_ref?.current[ri][ci] === undefined) grid_ref.current[ri][ci] = ref;
      if (state?.current.grid[ri][ci] === undefined) state.current.grid[ri][ci] = {x: ci, y: ri, occupied: false, has_food: false, has_bonus_food: false};
  }
  function handler_keypress(e) {
    // set direction;
    //dont change to opposite direction (ie from where you're coming from)
    let key =  e.key.toUpperCase()        
      //! create a mapping for directions, which becomes actual when we move. Otherwise we can go into the snake if we change direction too fast
    if (key === "ARROWRIGHT" || key ==="6")  state.current.pending_direction ="r";
    if (key === "ARROWLEFT" || key ==="4")   state.current.pending_direction = "l"
    if (key=== "ARROWDOWN" ||key === "2")  state.current.pending_direction = "d";
    if (key ===  "ARROWUP" ||key === "8")   state.current.pending_direction = "u";  
    if (key === "V") eat();
    if (key === "B") faster();
    if ( key === "ESCAPE") pause_play()
    //if (key === " "|| key === "ESCAPE") console.log(state.current)
    if (key === "F") feed();
    if (key === "R") reset();
  }
  function handleTilt(e) {
    if (e === "d")  state.current.pending_direction = "d";
     if (e === "u")  state.current.pending_direction = "u";
      if (e === "l")  state.current.pending_direction = "l";
       if (e === "r")  state.current.pending_direction = "r";

    

    
  }
  function move () {
  
    if (!!state.current.is_paused) return;
    let key = state.current.direction;
    let pending = state.current.pending_direction;

    //update final pending change
    if ((key ==="r" && pending !=="l") || (key ==="l" && pending !=="r") || (key ==="u" && pending !=="d") || (key ==="d" && pending !=="u")) { 
        key = pending;
        state.current.direction = key;
      }
    // calc head movement;  
    let new_head = {...head.current};
    if (key==="r" ) new_head.x += 1;
    if (key==="l" )  new_head.x -= 1;
    if (key==="d" )  new_head.y += 1;
    if (key==="u") new_head.y -= 1;
    // calc wall wraparound
    if (new_head.x < 0) new_head.x = size.current - 1;
    if (new_head.x >= size.current) new_head.x = 0;
    if (new_head.y < 0) new_head.y = size.current - 1;
    if (new_head.y >= size.current) new_head.y = 0;
    // Apply movements: to head & tail
    if (new_head !== null) {
      // Sorta UI changes (+ a bit more)
      // --> Detect collision
      occupyBlock(new_head.x, new_head.y); // head
      vacateBlock(head.current.x, head.current.y); // tail
      // State changes
      state.current.snake.shift(); // update state;
      state.current.snake.push(new_head); // update state;
      setHead(new_head); // update state
      // Post-state-change: add food.
      if (!state.current.has_started) {
        feed();
        state.current.has_started = true;
      } 
    }

  }
  function occupyBlock(x, y) {
     
      state.current.grid[y][x].occupied = true;
      let block = grid_ref?.current[y][x];
      if (state.current.grid[y][x].has_food) {
        // eat food
        state.current.grid[y][x].has_food = false;
        eat();
        feed();
        faster();
      } else {
         if (block?.className?.includes("!bg-green-500")) {
        block.className = (css_col + " !bg-red-500 animate-pulse");       
        
        set_ended(true)  
        return;
      }
        if (block?.className)  block.className +=(" !bg-green-500");
      }
     
  }
  function vacateBlock(x, y) {
    state.current.grid[y][x].occupied = false; 
    let tail = state.current.snake[0];

    if (tail && grid_ref?.current[tail.y]?.[tail.x]?.className) {
      grid_ref.current[tail.y][tail.x].className = css_col;
    }
    
  }
  function pause_play () {
      state.current.is_paused = ! state.current.is_paused
      setPaused(state.current.is_paused)
  }
  function reset () {
    set_ended(false)
    window.location.reload()
  }
  function start_game () {
   
   
    if (state.current.is_paused) pause_play()

  }
  //Initializations
  
 


// Key events
 useLayoutEffect(() => {
    window.addEventListener("keydown", handler_keypress);
    return () => window.removeEventListener("keydown", handler_keypress);
 },[handler_keypress, grid_ref.current ]);

//  useLayoutEffect(() => {
//     // Note: update tis to use requestAnimationFrame for smoother movement
//     // -> Definitions
//     let effect_speed, time_elapsed, ID_move, ID_checkSpeed;
//     effect_speed = state.current.speed;
//     //  -> Method definitions
//     function change_effect_speed  ()  {
//         if (effect_speed !== state.current.speed) {
//           effect_speed = state.current.speed;
//           stopLoop();
//           startLoop();
//           console.log("speed changed to ", effect_speed)
//         }
//     }
//     function stopLoop () {
//       clearInterval(ID_move);
//       clearInterval(ID_checkSpeed);
//     }
//     function startLoop () {
//       ID_move = setInterval(() => { move()  }, effect_speed);
//       ID_checkSpeed = setInterval(change_effect_speed, effect_speed);
//     } 
//     // -> -> Begin
//     startLoop();
//     return () => {
//       stopLoop();
//     }
  
//  }, [move]) 
  useLayoutEffect(() => {
    let ID_animation, start, interval;
    start = performance.now();
    interval = state.current.speed;
    function animate_movement (time) {
        if (interval !== state.current.speed) interval = state.current.speed; // update interval if speed changed
        // implement logic
        let time_elapsed = time - start; // calc time.
        if (time_elapsed >= interval) { move();  start = time; } // run when interval elapsed
        ID_animation = requestAnimationFrame(animate_movement); // we're calling ourselves... hmm.
        
    };

     // => Init. animation. 
    if (!state.current.is_paused) ID_animation = requestAnimationFrame(animate_movement);
    return () => cancelAnimationFrame(ID_animation); // cleanup.
  }, [move]);
  
  useEffect(() => {
   
    if (ended) {
      state.current.is_paused=true;
      setPaused(false)
    }
  }, [ended, isPaused, setPaused])
  


  //Make grid;

 function render_rows({_array, _ref_grid}) {
    return _array.map((r, ri) => {
      if (_ref_grid?.current[ri] === undefined) _ref_grid.current[ri] = []; //stored in reference.
      if (state.current.grid[ri] === undefined) state.current.grid[ri] = []; // stored in state.
      return (
        <tr key={ri} className={css_row}>
          {_array.map((c, ci) => {
            return <Block key={`row_${ri}_col_${ci}`} index={{ri, ci}} handler_ref={handler_blockRef}/>;
          })}
        </tr>
    );
  });
 }
//  const Rows = useMemo( () => render_rows({_array: array, _ref_grid: grid_ref}));
//const Rows = render_rows({_array: array, _ref_grid: grid_ref})

  return (
    <div>
       <MobileController onTilt={handleTilt} onOrientation={undefined}/>
       
      <div className="font-display text-lg text-white flex flex-row justify-between mb-2">
        <span>Score: </span>
         <span>Level: {(81 - state.current.speed)} /100</span>
        
      </div>
    <table >
      <tbody>
      
    { render_rows({_array: array, _ref_grid: grid_ref})}
  </tbody>
    </table>
     <Modal isPaused={state.current.is_paused} pause_play={pause_play} reset={reset} ended={ended} state={state.current}/>
      
    </div>
  );
} 


const Block = memo(function ({index, handler_ref, ...props}) {
  const { ri, ci } = index;
  return  (<td  className={` ${css_col }`} ref={(ref) => handler_ref(ref, ri, ci)}></td>)
})