export const accountsObj =  `
<div class="container">
<div class="table-wrapper">
    <div class="table-title">
        <div class="row">
            <div class="col-sm-6">
                <h2><b>Gerenciar  Contas</b></h2>
            </div>
            <div class="col-sm-6">
                <a href="#addContaModal" class="btn btn-success" data-toggle="modal"><i class="material-icons">&#xE147;</i> <span>Adicionar</span></a>
                <a href="#deleteContaModal" class="btn btn-danger" data-toggle="modal"><i class="material-icons">&#xE15C;</i> <span>Deletar</span></a>						
            </div>
        </div>
    </div>
    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th>
                    <span class="custom-checkbox">
                        <input type="checkbox" id="selectAll">
                        <label for="selectAll"></label>
                    </span>
                </th>
                <th>Email</th>
                <th>Senha</th>
            </tr>
        </thead>
        <tbody id="table-results">
            
        </tbody>
    </table>
</div>
</div>
<!-- Edit Modal HTML -->
<div id="addContaModal" class="modal fade">
<div class="modal-dialog">
    <div class="modal-content">
        <form>
            <div class="modal-header">						
                <h4 class="modal-title">Add Conta</h4>
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            </div>
            <div class="modal-body">					
                <div class="form-group">
                    <label>Email</label>
                    <input id="email-input" type="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input id="senha-input" type="text" class="form-control" required></input>
                </div>
            </div>
            <div class="modal-footer">
                <input type="button" class="btn btn-default" data-dismiss="modal" value="Cancel">
                <input type="button" class="btn btn-success" data-dismiss="modal" onclick="saveAccount()" value="Add">
            </div>
        </form>
    </div>
</div>
</div>
<!-- Edit Modal HTML -->
<div id="editContaModal" class="modal fade">
<div class="modal-dialog">
    <div class="modal-content">
        <form>
            <div class="modal-header">						
                <h4 class="modal-title">Edit Conta</h4>
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            </div>
            <div class="modal-body">					
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <textarea class="form-control" required></textarea>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" class="form-control" required>
                </div>					
            </div>
            <div class="modal-footer">
                <input type="button" class="btn btn-default" data-dismiss="modal" value="Cancel">
                <input type="submit" class="btn btn-info" value="Save">
            </div>
        </form>
    </div>
</div>
</div>
<!-- Delete Modal HTML -->
<div id="deleteContaModal" class="modal fade">
<div class="modal-dialog">
    <div class="modal-content">
        <form>
            <div class="modal-header">						
                <h4 class="modal-title">Delete Conta</h4>
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            </div>
            <div class="modal-body">					
                <p>Confirmar Exclusão</p>
                <p class="text-warning"><small>Continuar</small></p>
            </div>
            <div class="modal-footer">
                <input type="button" class="btn btn-default" data-dismiss="modal" value="Cancel">
                 <input type="button" onclick="deleteAccount()" class="btn btn-danger" value="Delete" data-dismiss="modal">
            </div>
        </form>
    </div>
</div>
</div>
`

export const postsObj =  `
<div class="container">
<div class="table-wrapper">
    <div class="table-title">
        <div class="row">
            <div class="col-sm-6">
                <h2><b>Gerenciar  Posts</b></h2>
            </div>
            <div class="col-sm-6">
                <a href="#addContaModal" class="btn btn-success" data-toggle="modal"><i class="material-icons">&#xE147;</i> <span>Adicionar</span></a>
                <a href="#deleteContaModal" class="btn btn-danger" data-toggle="modal"><i class="material-icons">&#xE15C;</i> <span>Deletar</span></a>						
            </div>
        </div>
    </div>
    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th>
                    <span class="custom-checkbox">
                        <input type="checkbox" id="selectAll">
                        <label for="selectAll"></label>
                    </span>
                </th>
                <th>Url</th>
                <th>Status</th>
                <th><button class="pending-btns" onclick="setAllPending()"> Todos Pendentes <button></th>
            </tr>
        </thead>
        <tbody id="table-results">
            
        </tbody>
    </table>
</div>
</div>
<!-- Edit Modal HTML -->
<div id="addContaModal" class="modal fade">
<div class="modal-dialog">
    <div class="modal-content">
        <form>
            <div class="modal-header">						
                <h4 class="modal-title">Add Conta</h4>
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            </div>
            <div class="modal-body">					
                <div class="form-group">
                    <label>Url</label>
                    <input id="url-input" type="text" class="form-control" required>
                </div>
            </div>
            <div class="modal-footer">
                <input type="button" class="btn btn-default" data-dismiss="modal" value="Cancel">
                <input onclick="savePost()" type="button" class="btn btn-success" data-dismiss="modal" value="Add">
            </div>
        </form>
    </div>
</div>
</div>
<!-- Edit Modal HTML -->
<div id="editContaModal" class="modal fade">
<div class="modal-dialog">
    <div class="modal-content">
        <form>
            <div class="modal-header">						
                <h4 class="modal-title">Edit Conta</h4>
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            </div>
            <div class="modal-body">					
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Url</label>
                    <input type="Url" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <textarea class="form-control" required></textarea>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" class="form-control" required>
                </div>					
            </div>
            <div class="modal-footer">
                <input type="button" class="btn btn-default" data-dismiss="modal" value="Cancel">
                <input type="submit" class="btn btn-info" value="Save">
            </div>
        </form>
    </div>
</div>
</div>
<!-- Delete Modal HTML -->
<div id="deleteContaModal" class="modal fade">
<div class="modal-dialog">
    <div class="modal-content">
        <form>
            <div class="modal-header">						
                <h4 class="modal-title">Delete Conta</h4>
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            </div>
            <div class="modal-body">					
                <p>Confirmar Exclusão</p>
                <p class="text-warning"><small>Continar</small></p>
            </div>
            <div class="modal-footer">
                <input type="button" class="btn btn-default" data-dismiss="modal" value="Cancel">
                 <input type="button" onclick="deletePost()" class="btn btn-danger" value="Delete" data-dismiss="modal">
            </div>
        </form>
    </div>
</div>
</div>
`

export const inicioObj = `
<div class="grid-container">
<div>
    <div class="grid-item">
    <table style="width:100%" id="emails-content">
    <tr  style="width:100%;">
      <th>Email</th>
      <th>Senha</th>
      <th>Status</th>
    </tr>
  </table>
    </div>
</div>
<div>
    <div id="console" class="grid-item">
        
    </div>
</div>
</div>
`

// <div>
//                     <div id="console-content" class="grid-item">
//                             <span>yyyyyyyy</span>
//                     </div>
//                 </div>