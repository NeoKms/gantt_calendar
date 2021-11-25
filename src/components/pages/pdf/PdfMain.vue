<template>
  <v-stepper v-model="step">
    <v-stepper-header class="stepper">
      <v-stepper-step :complete="step > 1" step="1"> {{$t('downloadAndView')}} </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > 2" step="2"> {{$t('choosePage')}} </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > 3" step="3"> {{$t('setBlocks')}} </v-stepper-step>
    </v-stepper-header>
    <div class="lighten pa-md-4">
      <input type="file" ref="pdffile" style="display: none" accept="application/pdf" @change="changeFileInput">
      <v-row class="ma-2">
        <v-col cols="3">
          <v-sheet elevation="6" class="centerColumn pa-4">
            <v-row v-if="step===1">
              <v-col cols="12">
                <v-btn :loading="loadingPdf||loadingPdfSave" @click="$refs.pdffile.click()" color="green">{{$t('addPdf')}}</v-btn>
              </v-col>
              <v-col cols="12">
                <v-divider />
              </v-col>
            </v-row>
            <v-row v-if="step===3" style="justify-content: center;">
              <v-col cols="3" v-if="!this.shapes.find(el=>el.fieldType==='title')">
                <v-btn @click="addNewShape('title')" color="green" small fab v-tooltip.auto="$t('addTitle')"><v-icon dark>mdi-format-title</v-icon></v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn @click="addNewShape('text')" color="green" small fab v-tooltip.auto="$t('addText')"><v-icon dark>mdi-text-recognition</v-icon></v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn @click="addNewShape('image')" color="green" small fab v-tooltip.auto="$t('addPicture')"><v-icon dark>mdi-image-plus</v-icon></v-btn>
              </v-col>
              <v-col cols="3" v-if="!this.shapes.find(el=>el.fieldType==='preview')">
                <v-btn @click="addNewShape('preview')" color="green" small fab v-tooltip.auto="$t('addPreview')"><v-icon dark>mdi-image-text</v-icon></v-btn>
              </v-col>
              <v-col cols="3" v-if="!this.shapes.find(el=>el.fieldType==='description')">
                <v-btn @click="addNewShape('description')" color="green" small fab v-tooltip.auto="$t('addDescription')"><v-icon dark>mdi-comment-text</v-icon></v-btn>
              </v-col>
              <v-col cols="12">
                <v-divider />
              </v-col>
            </v-row>
            <v-row v-if="step===3 && this.shapes.length">
              <v-col cols="12">
                <v-row v-for="(shape,ind) in this.shapes" dense :key="ind">
                  <v-col cols="2">
                    {{ind+1}}
                  </v-col>
                  <v-col cols="5" class="text-wrap">
                    {{getFieldType(shape.fieldType)}}
                  </v-col>
                  <v-col cols="2">
                    <v-btn @click="transformElement(shape.config.name,shape.pageId)" color="info" dark x-small icon><v-icon dark>mdi-selection-search</v-icon></v-btn>
                  </v-col>
                  <v-col cols="2">
                    <v-btn @click="destroyRect(shape.config.id)" color="red" dark x-small icon><v-icon dark>mdi-selection-off</v-icon></v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-divider />
              </v-col>
              <v-col cols="12">
                <v-btn @click="savePost" color="green" :loading="loadingSaver"
                       :disabled="
                       !this.shapes.find(el=>el.fieldType==='title')||
                       !this.shapes.find(el=>el.fieldType==='preview')||
                       !this.shapes.find(el=>el.fieldType==='description')
                      ">
                  {{$t('savePost')}}
                </v-btn>
              </v-col>
              <v-col cols="12">
                <v-divider />
              </v-col>
            </v-row>
            <v-row v-if="step===2">
              <v-col cols="12">
                <v-text-field
                  v-model="selectedPagesInterval"
                  :label="$t('pages')+' (1-2):'"
                  persistent-hint
                  outlined
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-divider />
              </v-col>
            </v-row>
            <v-row v-if="(stepNext || stepPrev) && !(loadingPdf||loadingPdfSave)">
              <v-col :cols="stepNext ? 6 : 12" v-if="stepPrev">
                <v-btn color="primary" @click="step===1?1:step--">{{$t('Back')}}</v-btn>
              </v-col>
              <v-col v-if="stepNext" :cols="stepPrev ? 6 : 12">
                <v-btn color="primary" @click="step===3?3:step++">{{$t('Continue')}}</v-btn>
              </v-col>
              <v-col cols="12">
                <v-divider />
              </v-col>
            </v-row>
          </v-sheet>
        </v-col>
        <v-col cols="6">
          <div class="centerColumn">
            <v-stage
              :config="configKonva"
              v-if="selectedPage>0"
              @mousedown="handleStageMouseDown"
              @dragend="handleStageDragEnd"
            >
              <v-layer ref="convLayer">
                <v-image
                  v-if="background.exist"
                  :config="background.config"
                  :key="background.name"
                  :id="background.id"
                >
                </v-image>
                <template v-for="(shape,ind) in shapes">
                  <template v-if="shape.type==='rect'">
                    <v-rect :config="shape.config" />
                    <v-circle :config="{ x: shape.config.x, y: shape.config.y, radius: 7, fill: 'black', name: 'Clabel_'+shape.config.id}" />
                    <v-text :config="{ text: ind+1, fontSize: 12, x: shape.config.x-3, y: shape.config.y-5, fill: 'white',name: 'Tlabel_'+shape.config.id}" />
                    <v-circle :config="{ x: shape.config.x+shape.config.width, y: shape.config.y, radius: 7, fill: 'white',stroke: 'red', strokeWidth: 1, name: 'Cdel_'+shape.config.id}"/>
                    <v-text :config="{ text: 'x', fontSize: 12, x: shape.config.x-3+shape.config.width, y: shape.config.y-5, fill: 'red', name: 'Tdel_'+shape.config.id}" />
                  </template>
                </template>
              </v-layer>
            </v-stage>
          </div>
        </v-col>
        <v-col cols="3">
          <v-sheet elevation="6" class="pa-4 rightColumn">
            <v-row v-for="(page,ind) in selectedPages" @click="changeNowPage(page.id)" :key="ind">
              <v-col cols="12">
                <v-sheet elevation="5" class="pdfPage pa-1" :class="{pdfPage_active: selectedPage===page.id}">
                  <v-btn
                    color="black" elevation="2" x-small rounded
                    absolute bottom left
                    dark icon v-tooltip.auto="$t('pageNum')"
                  ><span style="font-size: 12px"> {{ page.id }}</span>
                  </v-btn>
                  <v-btn
                    v-if="step===1 && false"
                    elevation="2" color="red" small rounded
                    absolute bottom right
                    icon dark v-tooltip.auto="$t('delPage')"
                    @click.stop="removePage(page.id)"
                  >
                    <v-icon>
                      mdi-trash-can-outline
                    </v-icon>
                  </v-btn>
                  <img :src="page.data" :id="`page_${page.id}`" :ref="`page_${page.id}`" width="180"/>
                </v-sheet>
              </v-col>
            </v-row>
          </v-sheet>
        </v-col>
      </v-row>
      <div ref="canvas" hidden></div>
    </div>
  </v-stepper>
</template>

<script>
  export default {
    name: "pdfreader",
    data() {
      return {
        loadingSaver: false,
        loadingPdf: false,
        loadingPdfSave: false,
        step: 1,
        shapes: [],
        selectedShape: '',
        pages: [],
        selectedPage: -1,
        selectedPagesInterval: '',
        configKonva: {
          width: 0,
          height: 0,
        },
        background: {
          type: 'img',
          name: 'background',
          id: 0,
          exist: false,
          config: {
            draggable: false,
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            image: {},
            attrs: {},
            name: 'background',
          }
        },
      }
    },
    watch: {
      step: function (step) {
        if (step===1) {
          this.selectedPagesInterval = ''
        }
        this.shapes = []
        this.destroyTransformer()
      },
      selectedPagesInterval: function (newInterval) {
        let interval = newInterval.split('-')
        if (interval.length===2 && parseInt(interval[0]) && parseInt(interval[1])) {
          this.changeNowPage(this.pages[parseInt(interval[0])-1].id)
        }
      }
    },
    computed: {
      stepNext() {
        return this.step!==3 && this.selectedPages.length
      },
      stepPrev() {
        return this.step!==1 && !this.loadingSaver
      },
      selectedPages() {
        let interval = this.selectedPagesInterval.split('-')
        if (interval.length===2 && parseInt(interval[0]) && parseInt(interval[1])) {
          return this.pages.slice(parseInt(interval[0])-1,parseInt(interval[1]))
        }
        return this.pages
      },
    },
    methods:{
      async savePost() {
        this.loadingSaver = true
        let additionalShapes = []
        this.selectedPages.map(page=>{
          if (typeof this.shapes.find(shape=>shape.pageId===page.id) === "undefined") {
            additionalShapes.push({
              "type": "rect",
              "name": "rect1",
              "fieldType": "text",
              "pageId": page.id,
              "config": {
                "id": 1,
                "draggable": true,
                "x": 1,
                "y": 1,
                "width": page.viewport.width -1,
                "height": page.viewport.height-1,
                "stroke": "red",
                "strokeWidth": 2,
                "name": "rect2",
                "rotation": 0,
                "scaleX": 1,
                "scaleY": 1,
                "offsetX": 0,
                "offsetY": 0,
                "skewX": 0,
                "skewY": 0
              }
            })
          }
        })
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.step = 2
        this.selectedPagesInterval = ''
        this.loadingSaver = false
      },
      getFieldType(fieldType) {
        return {
          "title": this.$t('title'),
          'text': this.$t('text'),
          'image': this.$t('picture'),
          'description': this.$t('description'),
          'preview': this.$t('preview')
        }[fieldType]
      },
      removePage(id) {
        let ind = this.pages.findIndex(el=>el.id===id)
        if (id===this.selectedPage) {
          this.selectedPage = -1
        }
        this.pages.splice(ind,1)
        if (this.pages.length>0) {
          this.changeNowPage(this.pages[0].id)
        }
      },
      addNewShape(fieldType) {
        let defShape = {
          type: 'rect',
          name: 'rect',
          fieldType,
          pageId: this.selectedPage,
          config: {
            id: 0,
            draggable: true,
            x: 20,
            y: 50,
            width: 100,
            height: 100,
            stroke: 'red',
            strokeWidth: 2,
            name: 'rect',
          }
        }
        let id = Math.max(...this.shapes.map(el => el.config.id), defShape.config.id) + 1
        defShape.name = defShape.config.name = defShape.name + id
        defShape.config.id = id
        this.shapes.push(defShape)
        this.$refs[`convLayer`].getStage().draw();
      },
      handleStageDragEnd() {
        const stage = this.$refs[`convLayer`].getStage();
        this.shapes.forEach((shape) => {
          let name = shape.config.name
          const elem = stage.findOne(`.${name}`);
          if (elem) {
            shape.config = JSON.parse(JSON.stringify(elem.attrs));
          }
        });
      },
      destroyRect(id) {
        this.shapes.splice(this.shapes.findIndex(el=>el.config.id===id),1);
        this.destroyTransformer()
      },
      destroyTransformer() {
        const stage = this.$refs[`convLayer`].getStage();
        let transformerNode = stage.findOne(".Transformer");
        if (transformerNode) {
          transformerNode.destroy();
          stage.draw();
        }
      },
      transformElement(name,pageId) {
        if (pageId !== this.selectedPage) {
          this.changeNowPage(pageId, ()=>{
            this.destroyTransformer()
            this.selectedShapeName = name
            this.updateTransformer()
          })
        } else {
          this.destroyTransformer()
          this.selectedShapeName = name
          this.updateTransformer()
        }
      },
      handleStageMouseDown(e) {
        const name = e.target.name();
        if (e.target.getParent().className === "Transformer") {
          return;
        }
        //удалить трансформер у другого элемента
        if (this.selectedShapeName !== e.target.attrs.name) {
          this.destroyTransformer()
        }
        // удалить элемент при клике на крестик
        if (name.indexOf('del')!==-1) {
          this.destroyRect(parseInt(name.split('_')[1]))
        }
        this.selectedShapeName = e.target.attrs.name;
        if (name==='background' || !this.shapes.map(el=>el.name).includes(name)) {
          return;
        }
        this.updateTransformer();
      },
      changeBtns(id, hide = true) {
        const stage = this.$refs[`convLayer`].getStage();
        stage.findOne(`.Clabel_${id}`)[hide?'hide':'show']();
        stage.findOne(`.Tlabel_${id}`)[hide?'hide':'show']();
        stage.findOne(`.Cdel_${id}`)[hide?'hide':'show']();
        stage.findOne(`.Tdel_${id}`)[hide?'hide':'show']();
      },
      updateTransformer() {
        const stage = this.$refs[`convLayer`].getStage();
        let transformer = stage.findOne(".Transformer");
        const selectedNode = stage.findOne("." + this.selectedShapeName);
        if (transformer && selectedNode === transformer.node()) {
          return;
        }
        //само изменение размеров
        selectedNode.on("transform", () => {
          selectedNode.setAttrs({
            height: Math.max(selectedNode.height() * selectedNode.scaleY(), 20),
            width: Math.max(selectedNode.width() * selectedNode.scaleX(), 20),
            scaleX: 1,
            scaleY: 1,
          });
        });
        // движение по сцене
        selectedNode.on('dragmove transform', () => {
          const box = selectedNode.getClientRect();
          const absPos = selectedNode.getAbsolutePosition();
          const offsetX = box.x - absPos.x;
          const offsetY = box.y - absPos.y;
          const newAbsPos = {...absPos}
          if (box.x < 0) newAbsPos.x = -offsetX;
          if (box.y < 0) newAbsPos.y = -offsetY;
          if (box.x + box.width > stage.width()) newAbsPos.x = stage.width() - box.width - offsetX;
          if (box.y + box.height > stage.height()) newAbsPos.y = stage.height() - box.height - offsetY;
          selectedNode.setAbsolutePosition(newAbsPos)
        })
        selectedNode.on('transformstart',()=>{
          this.changeBtns(selectedNode.attrs.id)
        })
        selectedNode.on('transformend',()=>{
          let attrs = selectedNode.attrs
          this.shapes.find(el=>el.config.id===attrs.id).config = JSON.parse(JSON.stringify(attrs));
          this.changeBtns(selectedNode.attrs.id, false)
        })
        transformer = new Konva.Transformer({
          name: "Transformer",
          rotateEnabled: false,
        });
        transformer.on('dragstart',()=>{
          this.changeBtns(selectedNode.attrs.id)
        })
        transformer.on('dragend',()=>{
          this.changeBtns(selectedNode.attrs.id, false)
        })
        transformer.nodes([selectedNode]);
        stage.add(transformer);
        stage.draw();
      },
      async changeFileInput() {
        this.loadingPdf = true
        this.pages = []
        let fileData = this.$refs.pdffile.files[0]
        this.loadingPdfSave = true
        this.loadingPdfSave = false
        let pdfjsLib = await this.getPdfjsLib()
        await this.readPdfFileToBuffer(fileData)
        .then(buffer=>pdfjsLib.getDocument(buffer))
        .then(loadingTask=>loadingTask.promise)
        .then(async pdf=>{
          let totalPages = pdf.numPages
          for (let i = 1; i <= totalPages; i++) {
            await this.pageToPng(pdf,i).then(data=>{
              this.pages.push(data)
              if (i===1) this.changeNowPage(1)
            })
          }
        })
        .then(()=>this.loadingPdf=false)
      },
      pageToPng(pdf,pageNumber) {
        return pdf.getPage(pageNumber)
          .then((page) => {
            let viewport = page.getViewport({scale: 1.5});
            let canvas = document.createElement('canvas');
            this.$refs['canvas'].appendChild(canvas);
            let context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            let renderContext = {canvasContext: context, viewport: viewport};
            let renderTask = page.render(renderContext);
            viewport.height = viewport.height / viewport.scale
            viewport.width = viewport.width / viewport.scale
            viewport.scale = 1
            return renderTask.promise.then(() => ({
              viewport,
              data: canvas.toDataURL('image/png'),
              id: pageNumber,
            }));
          })
      },
      readPdfFileToBuffer(file) {
        return new Promise( ((resolve, reject) => {
          let fileReader = new FileReader();
          fileReader.onload = function() {
            resolve(new Uint8Array(this.result))
          };
          fileReader.onerror = function() {
            reject('error with file to buffer func')
          }
          fileReader.readAsArrayBuffer(file);
        }))
      },
      getPdfjsLib() {
        return import("pdfjs-dist/build/pdf").then((pdfjsLib) => {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js"
          return pdfjsLib
        });
      },
      changeNowPage(id, additional=false) {
        const page = this.pages.find(el=>el.id===id)
        if (!page) return;
        const image = new window.Image(page.viewport.width,page.viewport.height);
        image.src = page.data;
        image.onload = () => {
          this.destroyTransformer()
          const stage = this.$refs[`convLayer`].getStage();
          this.shapes.forEach(shape=>{
            if (shape.pageId!==id) {
              stage.findOne(`.${shape.config.name}`).hide();
              this.changeBtns(shape.config.id)
            } else {
              stage.findOne(`.${shape.config.name}`).show();
              this.changeBtns(shape.config.id,false)
            }
          })
          if (additional!==false) additional()
          this.srcImg = image;
          stage.draw();
        };
        this.background.config.image = image;
        this.background.exist = true
        this.configKonva = page.viewport
        this.selectedPage=id
      },
    },
  }
</script>

<style scoped>
  .stepper {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 1;
  }
  .centerColumn {
    min-height: 600px;
    text-align: center;
    text-align: -webkit-center;
  }
.pdfPage {
  position: relative;
  text-align: center;
  cursor: pointer;
}
.pdfPage:hover {
  opacity: 0.6;
}
.pdfPage_active {
  background-color: #a7dbb0 !important;
}
  .rightColumn {
    overflow: auto;
    max-height: 600px;
    min-height: 600px;
  }
</style>
