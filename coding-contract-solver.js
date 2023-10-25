/** @param {import(".").NS} ns */
export async function main(ns) {
	if(!ns.fileExists("coding-contracts.txt")){
		ns.tprint(`WARNING ------- WITHOUT ANY CODING CONTRACT TO SOLVE -------`);
		ns.exit();
	}
	const coding_contracts = ns.read("coding-contracts.txt").split("\n").map(x => {
		const [contract_file, server] = x.split(',');
		return {contract_file: contract_file, server: server};
	});

	coding_contracts.forEach(x => {
			const filename = x.contract_file;
			const server = x.server;
			const title = ns.codingcontract.getContractType(filename, server);
			const data = ns.codingcontract.getData(filename, server);
			
			// ns.tprint(`INFO\n----- Title = ${title}\n -------- Data = ${JSON.stringify(data)}`)
		
			let reward;
			let found = true;
			if(title === "Unique Path In a Grid II (WIP)"){
				// const result = unique_path_in_a_grid_ii(data);
				// reward = ns.codingcontract.attempt(result, filename, server);
			} else if(title === "Algorithmic Stock Trader II"){
				const result = algorithmic_stock_trader_ii(data);
				reward = ns.codingcontract.attempt(result, filename, server);
			} else if(title === "Algorithmic Stock Trader III"){
				const result = algorithmic_stock_trader_iii(data);
				reward = ns.codingcontract.attempt(result, filename, server);
			} else if(title === "Shortest Path in a Grid"){
				const result = shortest_path_in_a_grid(data);
				reward = ns.codingcontract.attempt(result, filename, server);
			} else if(title === "Spiralize Matrix"){
				const result = spiralize_matrix(data);
				reward = ns.codingcontract.attempt(result, filename, server);
			} else if(title === "Array Jumping Game II"){
				const result = array_jumping_game_ii(data);
				reward = ns.codingcontract.attempt(result, filename, server);
			} else if(title === "Encryption II: Vigenère Cipher"){
				const result = encryption_ii_vigenere_cipher(data);
				reward = ns.codingcontract.attempt(result, filename, server);
			}
			else {
				ns.tprint(`ERROR\n[${server}] NOT FOUND METHOD TO SOLVE\n----- Title = ${title}\n -------- Data = ${JSON.stringify(data)}`);
				found = false;	
			}
		
			if(found){
				if(reward){
					ns.tprint(`INFO Contract ${filename} from server ${server} completed. Reward = ${reward}`);
				} else {
					ns.tprint(`ERROR Contract ${filename} from server ${server} failed. Attempts lefts: ${ns.codingcontract.getNumTriesRemaining(filename, server)}`);
				}
			}
	})
}

/**
 * 
 * @param {int[][]} grid 
 * @returns 
 */
function unique_path_in_a_grid_ii(grid){
    function solve(i, j){
        if(i >= grid.length || j >= grid[0].length){
            return 0
        }
        if(i == grid.length - 1 && j == grid[0].length - 1){
           return 1
        }
        if(grid[i][j] == 1){
            return 0
        }

        return solve(grid, i + 1, j) + solve(grid, i, j + 1)
    }
    
    return solve(grid, 0, 0)
}

/**
 * 
 * @param {int[]} data 
 */
function algorithmic_stock_trader_ii(data){
    // maxProfit adds up the difference between 
    // adjacent elements if they are in increasing order 
    var maxProfit = 0; 

    // The loop starts from 1 
    // as its comparing with the previous 
    for (let i = 1; i < data.length; i++) 
        if (data[i] > data[i - 1]){
            maxProfit += data[i] - data[i - 1]; 
        }
    return maxProfit; 
}

/**
 * 
 * @param {int[]} data 
 */
function algorithmic_stock_trader_iii(data){
	let res = 0;
  for(var i = 0; i < data.length; i++){
    for(var j = i + 1; j < data.length; j++){
      for(var k = j + 1; k < data.length; k++){
        for(var l = k + 1; l < data.length; l++){
          res = Math.max(res, Math.max(0, data[j] - data[i]) + Math.max(0, data[l] - data[k]));
        }
      }
    }
  }
  return res;
}


/**
 * 
 * @param {int[][]} data 
 * @returns 
 */
function shortest_path_in_a_grid(data){
    let parent = {};
    parent[[0, 0]] = [0, 0]
    let pos = [0, 0];
    let queue = [pos];
    while(queue.length > 0){
      const cur = queue.shift();
      if(cur[0] + 1 < data.length && parent[[cur[0] + 1, cur[1]]] === undefined && data[cur[0] + 1][cur[1]] === 0){
          queue.push([cur[0] + 1, cur[1]]);
          parent[[cur[0] + 1, cur[1]]] = cur;
      }
      if(cur[0] - 1 >= 0 && parent[[cur[0] - 1, cur[1]]] === undefined && data[cur[0] - 1][cur[1]] === 0){
          queue.push([cur[0] - 1, cur[1]]);
          parent[[cur[0] - 1, cur[1]]] = cur;
      }
      if(cur[1] + 1 < data[0].length && parent[[cur[0], cur[1] + 1]] === undefined && data[cur[0]][cur[1] + 1] === 0){
          queue.push([cur[0], cur[1] + 1]);
          parent[[cur[0], cur[1] + 1]] = cur;
      }
      if(cur[1] - 1 >= 0 && parent[[cur[0], cur[1] - 1]] === undefined && data[cur[0]][cur[1] - 1] === 0){
          queue.push([cur[0], cur[1] - 1]);
          parent[[cur[0], cur[1] - 1]] = cur;
      }
    }

    let result = "";
    let cur = [data.length - 1, data[0].length - 1];
    while(parent[cur] !== cur){
        const next = parent[cur];
        const diffI = next[0] - cur[0];
        const diffJ = next[1] - cur[1];
        let move = "";
        if(diffI === 1){
            move = "U";
        } else if(diffI === -1){
            move = "D";
        } else if(diffJ === 1){
            move = "L"
        } else if(diffJ === -1){
            move = "R"
        }
        result = move + result;
        cur = next;
    }

    return result;
}

function spiralize_matrix(data){
  let i = 0;
  let j = 0;
  let ops = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let idx = 0;
  let res = [];
  while(true){
    if(data[i][j] === "-"){
      break;
    }
    res.push(data[i][j]);
    data[i][j] = "-";
    let ii = i + ops[idx][0];
    let jj = j + ops[idx][1];
    if(ii < 0 || ii >= data.length || jj < 0 || jj >= data[0].length || data[ii][jj] === "-"){
        idx = (idx + 1) % (ops.length);
        ii = i + ops[idx][0];
        jj = j + ops[idx][1];
    }
    i = ii;
    j = jj;
  }

  return res
}

function array_jumping_game_ii(data){
	let res = new Array(data.length).fill(1e9);
  res[data.length - 1] = 0;
  for(var i = data.length - 2; i >= 0; i--){
    var jump_size = data[i];
    for(var j = i + 1; j < data.length && (j - i) <= jump_size; j++){
      res[i] = Math.min(res[i], res[j] + 1);
    }
  }

  return res[0];
}

function encryption_ii_vigenere_cipher(data){
	var map = {}
  for(var i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++){
    var idx = i - 'A'.charCodeAt(0);
    for(var j = 'A'.charCodeAt(0); j <= 'Z'.charCodeAt(0); j++){
      map[[String.fromCharCode(i), String.fromCharCode(j)]] = String.fromCharCode((j + idx - 'A'.charCodeAt(0))%26 + 'A'.charCodeAt(0));
    }
  }
  const plain_text = data[0];
  const pass = data[1];
  let res = "";
  for(var i = 0; i < plain_text.length; i++){
    res += map[[plain_text[i], pass[i % (pass.length)]]]
  }
  return res;
}