import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { read, utils } from "xlsx";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

const Main = () => {
  const [data, setData] = useState([]);
  const [list, refreshList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const callData = useCallback(() => {
    setLoading(true);
    fetch("/api/consult-packings")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        refreshList(res);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    callData();
  }, [callData]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectedFile = (event: any) => {
    const files = event.target.files;
    setSelectedFile(files);
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;
        if (sheets.length) {
          const rows: any = utils.sheet_to_json(wb.Sheets[sheets[0]]);
          refreshList(rows);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleImportFile = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("blob", selectedFile[0], "test");
      fetch("/api/save-report", {
        method: "POST",
        body: formData,
      })
        .then((r) => r.json())
        .then((data) => {
          setSnackbar({
            open: true,
            message: "Archivo importado correctamente",
          });
          callData();
        })
        .catch((err) => {
          setSnackbar({
            open: true,
            message: "Existe un error, intenta de nuevo",
          });
        });
    }
    setSnackbar({
      open: true,
      message: "Debes seleccionar un archivo primero",
    });
  };

  const handleCreateGeneralReport = () => {
    fetch("/api/create-general-report")
      .then((response) => response.blob())
      .then((blob) => {
        var file = window.URL.createObjectURL(blob);
        window.location.assign(file);
      })
      .catch((err) => {
        setSnackbar({
          open: true,
          message: "Existe un error, intenta de nuevo",
        });
        console.log(err);
      });
  };

  const handleDeleteFile = () => {
    setLoading(true);
    fetch("/api/delete-report")
      .then((res) => res.json())
      .then((res) => callData())
      .catch((res) => {
        setSnackbar({
          open: true,
          message: "Existe un error, intenta de nuevo",
        });
      })
      .finally(() => setLoading(false));
  };

  if (error) {
    return (
      <Box
        bgcolor="#fafafa"
        width="100%"
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h6">Existe un error 🚩</Typography>
        <Typography>Intenta de nuevo o intenta más tarde.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        bgcolor="#fafafa"
        width="100%"
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" mt={2}>
          Cargando...
        </Typography>
      </Box>
    );
  }

  return (
    <Container>
      <AppBar color="primary" position="static">
        <Toolbar>
          <Typography>TMP | ADMIN</Typography>
        </Toolbar>
      </AppBar>
      <Box my={2}>
        <input
          type="file"
          name="file"
          className="custom-file-input"
          id="inputGroupFile"
          required
          onChange={handleSelectedFile}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
        <Box display="flex" flexDirection="row" my={3} gap={5}>
          <Button
            color={data.length ? "info" : "primary"}
            variant="contained"
            fullWidth
            onClick={handleImportFile}
          >
            {data.length > 0 ? "Actualizar" : "Importar"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCreateGeneralReport}
          >
            Ver reporte general (CSV)
          </Button>
          <Tooltip title="Limpiar base de datos">
            <IconButton color="error" onClick={handleDeleteFile}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell align="right">Ballon Number</TableCell>
                <TableCell align="right">Build Sequence</TableCell>
                <TableCell align="right">Linea</TableCell>
                <TableCell align="right">Packing Disk No.</TableCell>
                <TableCell align="right">Part Number</TableCell>
                <TableCell align="right">PO No.</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Vendor No.</TableCell>
                <TableCell align="right">Update At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: any, index) => {
                  return (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {index + 1}
                      </TableCell>
                      <TableCell align="right">{row.balloonnumber}</TableCell>
                      <TableCell align="right">{row.buildsequence}</TableCell>
                      <TableCell align="right">{row.linea}</TableCell>
                      <TableCell align="right">{row.packingdiskno}</TableCell>
                      <TableCell align="right">{row.partnumber}</TableCell>
                      <TableCell align="right">{row.pono}</TableCell>
                      <TableCell align="right">{row.qty}</TableCell>
                      <TableCell align="right">{row.vendorno}</TableCell>
                      <TableCell align="right">{row.updateat}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!data.length && (
        <Box m={2}>
          <Typography fontWeight="bold">
            No existen datos disponibles ℹ️
          </Typography>
        </Box>
      )}
      <TablePagination
        rowsPerPageOptions={[10, 20, 50, 100, 200, 300, 500, data.length]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        action={
          <React.Fragment>
            <Button
              color="primary"
              size="small"
              onClick={() => setSnackbar({ open: false, message: "" })}
            >
              CERRAR
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => setSnackbar({ open: false, message: "" })}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </Container>
  );
};

export default Main;
