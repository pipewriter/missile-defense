class Triple{
    constructor(v1, v2, v3){
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
    }
}

class Vertex{
    // constructor(x, y, z, r, g, b, nx, ny, nz){
    //     this.x = x;
    //     this.y = y;
    //     this.z = z;
    //     this.r = r;
    //     this.g = g;
    //     this.b = b;
    //     this.nx = nx;
    //     this.ny = ny;
    //     this.nz = nz;
    // }
    constructor(pos, color, normal){
        this.x = pos.v1;
        this.y = pos.v2;
        this.z = pos.v3;
        
        this.r = color.v1;
        this.g = color.v2;
        this.b = color.v3;

        this.nx = normal.v1;
        this.ny = normal.v2;
        this.nz = normal.v3;
    }
}

class Triangle{
    constructor(p1, p2, p3){
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }
}

class LooseModel{
    constructor(vList, iList, vertCount){
        this.vList = vList;
        this.iList = iList;
        this.vertCount = vertCount;
    }
}

class Model{
    constructor(){
        this.triangles = [];
    }

    addTriangle(triangle){
        this.triangles.push(triangle);
    }

    getVertAndIndices(indexOffset, modelNumber){
        var vertexList = [];
        var indexList = [];
        var triCount = 0;
        for(var i = 0; i < this.triangles.length; i++){
            var tri = this.triangles[i];
            {
                var vert = tri.p1;
                vertexList.push(vert.x, vert.y, vert.z, vert.r, vert.g, vert.b, vert.nx, vert.ny, vert.nz);
                vertexList.push(modelNumber);
                indexList.push(triCount + indexOffset);
                triCount++;
            }
            {
                var vert = tri.p2;
                vertexList.push(vert.x, vert.y, vert.z, vert.r, vert.g, vert.b, vert.nx, vert.ny, vert.nz);
                vertexList.push(modelNumber);
                indexList.push(triCount + indexOffset);
                triCount++;
            }
            {
                var vert = tri.p3;
                vertexList.push(vert.x, vert.y, vert.z, vert.r, vert.g, vert.b, vert.nx, vert.ny, vert.nz);
                vertexList.push(modelNumber);
                indexList.push(triCount + indexOffset);
                triCount++;
            }
        }
        return {"vertexList": vertexList, "indexList":indexList, "triCount": triCount};
    }
}

class MegaList{
    constructor(){
        this.vertexList = [];
        this.indexList = [];
        this.triCount = 0;
        this.nextModelNumber = 0;
    }

    addVerts(verts){
        this.vertexList = this.vertexList.concat(verts);
    }

    addInds(inds){
        this.indexList = this.indexList.concat(inds);
    }

    addModel(model){
        var returnObj = model.getVertAndIndices(this.triCount, this.nextModelNumber);
        this.addVerts(returnObj.vertexList);
        this.addInds(returnObj.indexList);
        this.triCount += returnObj.triCount;
        this.nextModelNumber++;
    }

    addLoose(loose){
        this.addVerts(loose.vList);
        //var iListClone = loose.iList.slice(0);
        // for(var i = 0; i < iListClone.length; i++){
        //     iListClone[i] += this.triCount;
        // }
        this.addInds(loose.iList);
        this.triCount += loose.vertCount;
        this.nextModelNumber++;        
    }

    getV(){
        return new Float32Array(this.vertexList);
    }

    getI(){
        return new Uint16Array(this.indexList);
    }

    getTriCount(){
        return this.triCount;
    }
    
}